import { describe, expect, test } from "bun:test";
import { createTestDb } from "../test-db";
import { appRouter } from "./index";

async function setup() {
  return createTestDb();
}

const baseCtx = (db: never) => ({
  db,
  adminSecret: "s",
  adminPassword: "p",
  authorization: undefined,
});

async function authedCaller(db: never, extra: { deletePhoto?: (key: string) => Promise<void> } = {}) {
  const anon = appRouter.createCaller(baseCtx(db));
  const { token } = await anon.adminAuth.login({ password: "p" });
  return appRouter.createCaller({ ...baseCtx(db), ...extra, authorization: `Bearer ${token}` });
}

describe("admin product", () => {
  test("lists each product with its category name and variant count", async () => {
    const { db } = await setup();
    const caller = await authedCaller(db as never);
    const rows = await caller.adminProduct.list();
    const mochi = rows.find((row) => row.slug === "artisanal-mochi-daifuku")!;
    expect(mochi.categoryName).toBe("Mochi");
    expect(mochi.variantCount).toBe(3);
    const mango = rows.find((row) => row.slug === "authentic-mango-sticky-rice")!;
    expect(mango.variantCount).toBe(0);
  });

  test("keeps a photo in R2 while another product still uses it", async () => {
    const { db, client } = await setup();
    const deleted: string[] = [];
    const caller = await authedCaller(db as never, {
      deletePhoto: async (key) => {
        deleted.push(key);
      },
    });
    const url = "/api/photos/products/0f8fad5b-d9cb-469f-a165-70867728950e-w960.webp";
    client.exec(
      `update products set image_url = '${url}' where slug in ('artisanal-mochi-daifuku', 'mille-crepes')`,
    );
    const rows = await caller.adminProduct.list();
    const mochi = rows.find((row) => row.slug === "artisanal-mochi-daifuku")!;
    const crepes = rows.find((row) => row.slug === "mille-crepes")!;

    await caller.adminProduct.update({ id: mochi.id, imageUrl: null });
    expect(deleted).toEqual([]);

    await caller.adminProduct.remove({ id: crepes.id });
    expect(deleted.sort()).toEqual([
      "products/0f8fad5b-d9cb-469f-a165-70867728950e-w480.webp",
      "products/0f8fad5b-d9cb-469f-a165-70867728950e-w960.webp",
    ]);
  });

  test("lists inactive categories too, flagged, so the editor can show a product's current one", async () => {
    const { db, client } = await setup();
    const caller = await authedCaller(db as never);
    client.exec("update product_categories set is_active = 0 where slug = 'mochi'");
    const categories = await caller.adminProduct.categories();
    expect(categories.find((category) => category.slug === "mochi")?.isActive).toBe(false);
    expect(categories.find((category) => category.slug === "slice-cake")?.isActive).toBe(true);
  });

  test("discards an unsaved upload but never a photo a product still uses", async () => {
    const { db, client } = await setup();
    const deleted: string[] = [];
    const caller = await authedCaller(db as never, {
      deletePhoto: async (key) => {
        deleted.push(key);
      },
    });
    const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
    const used = `/api/photos/products/${id}-w480.webp`;
    client.exec(`update products set image_url = '${used}' where slug = 'mille-crepes'`);

    await caller.adminProduct.discardPhoto({ url: used });
    expect(deleted).toEqual([]);

    const orphan = "/api/photos/products/1b4e28ba-2fa1-41d2-883f-0016d3cca427-w960.webp";
    await caller.adminProduct.discardPhoto({ url: orphan });
    expect(deleted.sort()).toEqual([
      "products/1b4e28ba-2fa1-41d2-883f-0016d3cca427-w480.webp",
      "products/1b4e28ba-2fa1-41d2-883f-0016d3cca427-w960.webp",
    ]);
  });

  test("a save still succeeds when cleaning up the old photo fails", async () => {
    const { db, client } = await setup();
    const caller = await authedCaller(db as never, {
      deletePhoto: async () => {
        throw new Error("R2 down");
      },
    });
    client.exec("update products set image_url = '/api/photos/products/0f8fad5b-d9cb-469f-a165-70867728950e-w480.webp' where slug = 'mochi-x'");
    const rows = await caller.adminProduct.list();
    const target = rows.find((row) => row.slug === "slice-cake")!;
    client.exec(`update products set image_url = '/api/photos/products/0f8fad5b-d9cb-469f-a165-70867728950e-w480.webp' where id = ${target.id}`);
    const updated = await caller.adminProduct.update({ id: target.id, imageUrl: null });
    expect(updated.imageUrl).toBeNull();
  });

  test("rejects an unauthenticated caller", async () => {
    const { db } = await setup();
    const caller = appRouter.createCaller(baseCtx(db as never));
    await expect(caller.adminProduct.list()).rejects.toThrow();
  });

  test("creates, updates, and deletes a product", async () => {
    const { db, client } = await setup();
    const caller = await authedCaller(db as never);
    const categories = await caller.adminProduct.categories();
    const mochiCategory = categories.find((category) => category.slug === "mochi")!;

    const created = await caller.adminProduct.create({
      categoryId: mochiCategory.id,
      slug: "mochi-strawberry",
      name: "Mochi Stroberi",
      description: "Mochi isi krim stroberi.",
      priceCents: 8000,
      isFeatured: false,
      availability: "available",
    });
    expect(created.slug).toBe("mochi-strawberry");

    const updated = await caller.adminProduct.update({
      id: created.id,
      priceCents: 9000,
      availability: "preorder",
    });
    expect(updated.priceCents).toBe(9000);
    expect(updated.availability).toBe("preorder");

    await caller.adminProduct.remove({ id: created.id });
    const row = client
      .query("select id from products where slug = 'mochi-strawberry'")
      .get() as { id: number } | null;
    expect(row).toBeNull();
  });

  test("preserves unrelated fields during a partial update", async () => {
    const { db } = await setup();
    const caller = await authedCaller(db as never);
    const created = await caller.adminProduct.create({
      categoryId: 1,
      slug: "partial-update",
      name: "Partial Update",
      priceCents: 8000,
      isFeatured: true,
      availability: "preorder",
      displayOrder: 42,
    });
    const updated = await caller.adminProduct.update({ id: created.id, priceCents: 9000 });
    expect(updated.isFeatured).toBe(true);
    expect(updated.availability).toBe("preorder");
    expect(updated.displayOrder).toBe(42);
  });

  test("rejects a duplicate slug with CONFLICT", async () => {
    const { db } = await setup();
    const caller = await authedCaller(db as never);
    const categories = await caller.adminProduct.categories();
    const result = await caller.adminProduct.create({
      categoryId: categories[0]!.id,
      slug: "mille-crepes",
      name: "Duplikat",
      priceCents: 1000,
      isFeatured: false,
      availability: "available",
    }).catch((error) => error);
    expect((result as { code?: string; data?: { code?: string } }).code ?? (result as { data?: { code?: string } }).data?.code).toBe("CONFLICT");
  });

  test("rejects a negative price", async () => {
    const { db } = await setup();
    const caller = await authedCaller(db as never);
    const categories = await caller.adminProduct.categories();
    await expect(
      caller.adminProduct.create({
        categoryId: categories[0]!.id,
        slug: "negatif",
        name: "Negatif",
        priceCents: -1,
        isFeatured: false,
        availability: "available",
      }),
    ).rejects.toThrow();
  });
});

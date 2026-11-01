import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { relations } from "@delisert.mks-1/db/relations";
import { seed } from "@delisert.mks-1/db/seed";
import { appRouter } from "./index";

const MIGRATION = join(
  import.meta.dir,
  "../../../db/src/migrations/20261031071817_overjoyed_slipstream/migration.sql",
);

async function setup() {
  const client = new Database(":memory:");
  for (const statement of readFileSync(MIGRATION, "utf8").split("--> statement-breakpoint")) {
    if (statement.trim()) client.exec(statement);
  }
  const db = drizzle({ client, relations });
  await seed(db);
  return { client, db };
}

const baseCtx = (db: never) => ({
  db,
  adminSecret: "s",
  adminPassword: "p",
  authorization: undefined,
});

async function authedCaller(db: never) {
  const anon = appRouter.createCaller(baseCtx(db));
  const { token } = await anon.adminAuth.login({ password: "p" });
  return appRouter.createCaller({ ...baseCtx(db), authorization: `Bearer ${token}` });
}

describe("admin product", () => {
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

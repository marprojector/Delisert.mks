import { describe, expect, test } from "bun:test";

import { DEFAULT_SITE_CONTENT } from "../lib/site-content";
import { adminCaller, createTestDb, testCtx } from "../test-db";
import { authenticateMcpToken } from "./admin-insights";
import { appRouter } from "./index";

describe("site content router", () => {
  test("public content starts with the defaults and reflects admin edits", async () => {
    const { db } = await createTestDb();
    const anon = appRouter.createCaller(testCtx(db));
    expect((await anon.site.content()).home).toEqual(DEFAULT_SITE_CONTENT.home);

    const admin = await adminCaller(db);
    await admin.adminSite.update({
      section: "home",
      value: { ...DEFAULT_SITE_CONTENT.home, heroTitleLine1: "Dessert segar," },
    });
    expect((await anon.site.content()).home.heroTitleLine1).toBe("Dessert segar,");

    await admin.adminSite.reset({ section: "home" });
    expect((await anon.site.content()).home.heroTitleLine1).toBe(DEFAULT_SITE_CONTENT.home.heroTitleLine1);
  });

  test("invalid content is rejected with the field name", async () => {
    const { db } = await createTestDb();
    const admin = await adminCaller(db);
    await expect(
      admin.adminSite.update({ section: "brand", value: { ...DEFAULT_SITE_CONTENT.brand, whatsappNumber: "0851" } }),
    ).rejects.toThrow("whatsappNumber");
  });

  test("editing content requires an admin session", async () => {
    const { db } = await createTestDb();
    const anon = appRouter.createCaller(testCtx(db));
    await expect(anon.adminSite.update({ section: "home", value: DEFAULT_SITE_CONTENT.home })).rejects.toThrow(
      "Silakan login",
    );
  });
});

describe("category router", () => {
  test("creates, reorders and refuses to delete a category that has products", async () => {
    const { db } = await createTestDb();
    const admin = await adminCaller(db);
    const created = await admin.adminCategory.create({ name: "Es Krim", slug: "es-krim", isActive: true });
    let list = await admin.adminCategory.list();
    expect(list.at(-1)!.slug).toBe("es-krim");

    await admin.adminCategory.move({ id: created.id, direction: "up" });
    list = await admin.adminCategory.list();
    expect(list.at(-2)!.slug).toBe("es-krim");

    const mochi = list.find((row) => row.slug === "mochi")!;
    expect(mochi.productCount).toBeGreaterThan(0);
    await expect(admin.adminCategory.remove({ id: mochi.id })).rejects.toThrow("masih dipakai");
    await admin.adminCategory.remove({ id: created.id });
    expect((await admin.adminCategory.list()).some((row) => row.slug === "es-krim")).toBe(false);
  });

  test("duplicate slugs are a conflict", async () => {
    const { db } = await createTestDb();
    const admin = await adminCaller(db);
    await expect(admin.adminCategory.create({ name: "Mochi 2", slug: "mochi", isActive: true })).rejects.toThrow(
      "sudah dipakai",
    );
  });
});

describe("activity log", () => {
  test("records admin and MCP changes with their actor", async () => {
    const { db } = await createTestDb();
    const admin = await adminCaller(db);
    const [product] = await admin.adminProduct.list();
    await admin.adminProduct.setAvailability({ id: product!.id, availability: "soldout" });
    const viaMcp = await adminCaller(db, { actor: "mcp:Claude" });
    await viaMcp.adminProduct.setAvailability({ id: product!.id, availability: "available" });

    const log = await admin.adminActivity.list({ limit: 5 });
    expect(log[0]!.actor).toBe("mcp:Claude");
    expect(log[0]!.summary).toContain("Tersedia");
    expect(log[1]!.actor).toBe("admin");
  });
});

describe("mcp tokens", () => {
  test("token is shown once, works until revoked, and is stored hashed", async () => {
    const { db, client } = await createTestDb();
    const admin = await adminCaller(db);
    const created = await admin.adminMcp.create({ name: "Claude Desktop", scope: "read" });
    expect(created.token.startsWith("dlsrt_")).toBe(true);
    expect((await admin.adminMcp.list())[0]).not.toHaveProperty("token");
    const stored = client.query("select token_hash from mcp_tokens").get() as { token_hash: string };
    expect(stored.token_hash).not.toBe(created.token);

    expect(await authenticateMcpToken(db, created.token)).toEqual({
      id: created.id,
      name: "Claude Desktop",
      scope: "read",
    });
    expect((await admin.adminMcp.list())[0]!.lastUsedAt).not.toBeNull();

    await admin.adminMcp.revoke({ id: created.id });
    expect(await authenticateMcpToken(db, created.token)).toBeNull();
    expect(await authenticateMcpToken(db, "dlsrt_wrongwrongwrongwrongwrong")).toBeNull();
  });
});

describe("analytics", () => {
  test("reports unconfigured instead of failing when no token is set", async () => {
    const { db } = await createTestDb();
    const admin = await adminCaller(db);
    expect(await admin.adminAnalytics.summary({ days: 7 })).toEqual({ status: "unconfigured" });
  });

  test("reports Cloudflare errors as a status", async () => {
    const { db } = await createTestDb();
    const admin = await adminCaller(db, {
      analytics: { apiToken: "t", accountTag: "a", siteTag: "s" },
      fetch: (async () => new Response("nope", { status: 403 })) as unknown as typeof fetch,
    });
    const result = await admin.adminAnalytics.summary({ days: 7 });
    expect(result.status).toBe("error");
  });
});

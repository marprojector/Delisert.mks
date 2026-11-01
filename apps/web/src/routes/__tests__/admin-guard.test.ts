import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("admin routes", () => {
  test("the login page is reachable without a session", async () => {
    const response = await fetch(`${BASE}/admin/login`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Masuk");
  });

  test("admin pages are not indexed", async () => {
    const response = await fetch(`${BASE}/admin`, { redirect: "manual" });
    // TanStack Router redirects an unauthenticated visitor, so either a
    // redirect or a noindex document is acceptable; an indexable admin page
    // is not.
    if (response.status >= 300 && response.status < 400) {
      expect(response.headers.get("location")).toContain("/admin/login");
      return;
    }
    const html = await response.text();
    expect(html).toContain('name="robots"');
    expect(html).toContain("noindex");
  });

  test("admin mutations reject a forged token", async () => {
    const response = await fetch(`${BASE}/api/trpc/adminProduct.list?batch=1&input=%7B%7D`, {
      headers: { authorization: "Bearer forged.signature" },
    });
    expect(response.status).toBe(401);
  });

  test("new product route renders the editor", async () => {
    const html = await (await fetch(`${BASE}/admin/produk/baru`)).text();
    expect(html).toContain("Tambah produk");
    expect(html).toContain("Nama produk");
  });

  test("existing product route renders the editor", async () => {
    const html = await (await fetch(`${BASE}/admin/produk/1`)).text();
    expect(html).toContain("Ubah produk");
    expect(html).toContain("Nama produk");
  });
});

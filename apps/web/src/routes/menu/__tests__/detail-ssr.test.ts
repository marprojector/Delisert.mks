import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("product detail SSR", () => {
  test("returns 200 with the product title in the HTML", async () => {
    const response = await fetch(`${BASE}/menu/artisanal-mochi-daifuku`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Artisanal Mochi Daifuku");
    expect(html).toContain("Rp 8.000");
  });

  test("returns 404 for an unknown slug", async () => {
    const response = await fetch(`${BASE}/menu/produk-tidak-ada`);
    expect(response.status).toBe(404);
    const html = await response.text();
    expect(html).toContain("tidak ditemukan");
  });
});

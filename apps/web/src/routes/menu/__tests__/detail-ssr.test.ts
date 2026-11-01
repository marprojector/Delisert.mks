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

  test("catalogue renders products in the initial HTML", async () => {
    const response = await fetch(`${BASE}/menu`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).not.toContain("Memuat katalog");
    expect(html).toContain("Artisanal Mochi Daifuku");
    expect(html).toContain("Rp 8.000");
    expect(html).toContain("Rp 16.000");
  });

  test("homepage renders featured products in the initial HTML", async () => {
    const response = await fetch(`${BASE}/`);
    const html = await response.text();
    expect(html).not.toContain("Memuat produk");
    expect(html).toContain("Menu Andalan");
    expect(html).toContain("Rp 35.000");
  });

  test("each page emits exactly one canonical and no localhost URL", async () => {
    for (const path of ["/", "/tentang", "/menu", "/jadwal", "/kontak"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      const canonicals = html.match(/rel="canonical"/g) ?? [];
      expect({ path, count: canonicals.length }).toEqual({ path, count: 1 });
      expect({ path, hasLocalhost: html.includes('content="http://localhost:3001"') }).toEqual({
        path,
        hasLocalhost: false,
      });
    }
  });
});

import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("sitemap.xml", () => {
  test("serves absolute URLs for every public page", async () => {
    const response = await fetch(`${BASE}/sitemap.xml`);
    expect(response.status).toBe(200);
    const xml = await response.text();
    for (const path of ["/", "/tentang", "/menu", "/jadwal", "/kontak"]) {
      expect(xml).toContain(`<loc>${BASE}${path}</loc>`);
    }
    expect(xml).not.toContain("<loc>/menu</loc>");
  });

  test("includes one entry per product", async () => {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    expect(xml).toContain("/menu/artisanal-mochi-daifuku");
    expect(xml).toContain("/menu/mille-crepes");
  });
});

describe("robots.txt", () => {
  test("points at an absolute sitemap URL and hides admin", async () => {
    const text = await (await fetch(`${BASE}/robots.txt`)).text();
    expect(text).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    expect(text).toContain("Disallow: /admin");
  });
});

import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";
const PAGES = ["/", "/tentang", "/menu", "/jadwal", "/kontak"];

describe("accessibility structure", () => {
  test("every page has exactly one h1", async () => {
    for (const path of PAGES) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      const count = (html.match(/<h1[\s>]/g) ?? []).length;
      expect({ path, count }).toEqual({ path, count: 1 });
    }
  });

  test("every page has a skip link targeting main-content", async () => {
    for (const path of PAGES) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect({ path, skip: html.includes('href="#main-content"') }).toEqual({ path, skip: true });
      expect({ path, main: html.includes('id="main-content"') }).toEqual({ path, main: true });
    }
  });

  test("html declares Indonesian", async () => {
    const html = await (await fetch(`${BASE}/`)).text();
    expect(html).toContain('<html lang="id"');
  });
});

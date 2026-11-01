import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("published claims", () => {
  test("no unverified certification or origin claims appear", async () => {
    for (const path of ["/", "/tentang", "/menu", "/jadwal", "/kontak"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect({ path, claim: html.includes("100% HALAL") }).toEqual({ path, claim: false });
      expect({ path, claim: html.includes("Pelopor") }).toEqual({ path, claim: false });
      expect({ path, claim: html.includes("durian Medan") }).toEqual({ path, claim: false });
      expect({ path, claim: html.includes("matang pohon") }).toEqual({ path, claim: false });
      expect({ path, claim: html.includes("LIVE SEKARANG") }).toEqual({ path, claim: false });
    }
  });

  test("CFD hours are stated consistently", async () => {
    for (const path of ["/", "/jadwal"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect({ path, hours: html.includes("06.00 – 10.00 WITA") }).toEqual({ path, hours: true });
    }
  });

  test("the operational address is never called a store", async () => {
    const html = await (await fetch(`${BASE}/jadwal`)).text();
    expect(html).toContain("Bukan toko ritel publik");
    expect(html).not.toMatch(/Alamat Toko/i);
  });

  test("every product image carries an alt attribute", async () => {
    const html = await (await fetch(`${BASE}/menu`)).text();
    for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
      expect(tag).toContain("alt=");
    }
  });
});

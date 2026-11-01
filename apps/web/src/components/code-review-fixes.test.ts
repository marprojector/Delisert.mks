import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(import.meta.dir, path), "utf8");

describe("code review fixes", () => {
  test("a failed session check shows an error with retry instead of a blank admin page", () => {
    const admin = read("../routes/admin.tsx");
    expect(admin).toContain("session.isError");
    expect(admin).toContain("Coba lagi");
  });

  test("cards rendered after the page loads are revealed too", () => {
    expect(read("../lib/motion.ts")).toContain("new MutationObserver(");
  });

  test("a failed product list load says so instead of claiming the catalogue is empty", () => {
    const list = read("../routes/admin.produk.tsx");
    expect(list).toContain("products.isError");
    expect(list).toContain("Gagal memuat produk");
  });

  test("tapping any link in the phone menu closes it, even the current page", () => {
    const header = read("header.tsx");
    expect(header).toMatch(/<Link[\s\S]{0,200}onClick=\{\(\) => setOpen\(false\)\}/);
  });

  test("the editor discards photos uploaded but not kept", () => {
    expect(read("../routes/admin.produk.$id.tsx")).toContain("discardPhoto");
  });

  test("the editor shows a product's inactive category instead of the placeholder", () => {
    expect(read("../routes/admin.produk.$id.tsx")).toContain("(nonaktif)");
  });

  test("the variant editor parses prices with the shared helper", () => {
    expect(read("variant-editor.tsx")).toContain("rupiahToCents(");
  });
});

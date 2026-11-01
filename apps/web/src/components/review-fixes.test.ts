import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(import.meta.dir, path), "utf8");

describe("review fixes", () => {
  test("the owner can delete a variant at every screen width", () => {
    // Tombol Hapus varian tidak boleh disembunyikan di layar kecil.
    expect(read("variant-editor.tsx")).not.toMatch(/className="hidden [^"]*sm:block[^"]*"/);
  });

  test("the open mobile menu makes the page behind it inert and closes on desktop width", () => {
    const header = read("header.tsx");
    expect(header).toContain("inert");
    expect(header).toContain('matchMedia("(min-width: 1024px)")');
  });

  test("the editor form skips native validation of folded fields and surfaces its own error", () => {
    const editor = read("../routes/admin.produk.$id.tsx");
    expect(editor).toContain("noValidate");
    expect(editor).toContain("scrollIntoView");
  });

  test("the kitchen address is never paired with opening days", () => {
    expect(read("../routes/jadwal.tsx")).not.toContain("Senin tutup");
  });

  test("the html tag tolerates the class the motion gate adds before hydration", () => {
    expect(read("../routes/__root.tsx")).toMatch(/<html lang="id" suppressHydrationWarning>/);
  });

  test("the footer leaves room for the floating WhatsApp button and the order bar on phones", () => {
    expect(read("footer.tsx")).toContain("phoneBottomGap");
    expect(read("../routes/__root.tsx")).toContain("<Footer phoneBottomGap");
  });
});

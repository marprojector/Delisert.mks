import { describe, expect, test } from "bun:test";
import { renderWithRouter } from "../test-utils/render-with-router";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { Footer } from "./footer";

describe("site footer", () => {
  test("lists the weekly schedule, the WhatsApp number and both social handles", async () => {
    const html = await renderWithRouter(<Footer />);
    expect(html).toContain("Sel–Sab");
    expect(html).toContain("Senin · Libur");
    expect(html).toContain("0851 9002 1421");
    expect(html).toContain("@delisert.mks");
    expect(html).toContain("@delisert.mkss");
  });
});

describe("floating WhatsApp button", () => {
  test("renders nothing when hidden", async () => {
    const html = await renderWithRouter(<FloatingWhatsApp hidden />);
    expect(html).not.toContain("wa.me");
  });

  test("links to the business WhatsApp number", async () => {
    const html = await renderWithRouter(<FloatingWhatsApp />);
    expect(html).toContain('href="https://wa.me/6285190021421');
  });
});

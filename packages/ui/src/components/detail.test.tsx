import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductGallery } from "./product-gallery";
import { StickyOrderBar } from "./sticky-order-bar";
import { VariantPicker, availableVariantName } from "./variant-picker";

const mochi = [
  { id: 1, name: "1 Pcs", priceCents: 8000, isAvailable: true },
  { id: 2, name: "Isi 4 pcs", priceCents: 30000, isAvailable: true },
  { id: 3, name: "Isi 8 pcs", priceCents: 50000, isAvailable: false },
];

describe("VariantPicker", () => {
  test("renders one radio per variant and checks the chosen one", () => {
    const html = renderToStaticMarkup(
      <VariantPicker name="ukuran" variants={mochi} value="Isi 4 pcs" onChange={() => {}} />,
    );
    expect(html.match(/type="radio"/g)?.length).toBe(3);
    expect(html).toContain("Isi 4 pcs");
    expect(html).toMatch(/value="Isi 4 pcs"[^>]*checked=""|checked=""[^>]*value="Isi 4 pcs"/);
  });

  test("disables an unavailable variant and says it is sold out", () => {
    const html = renderToStaticMarkup(
      <VariantPicker name="ukuran" variants={mochi} value="1 Pcs" onChange={() => {}} />,
    );
    expect(html).toMatch(/disabled=""[^>]*value="Isi 8 pcs"|value="Isi 8 pcs"[^>]*disabled=""/);
    expect(html).toContain("Habis");
  });
});

describe("availableVariantName", () => {
  test("keeps an available choice", () => {
    expect(availableVariantName(mochi, "Isi 4 pcs")).toBe("Isi 4 pcs");
  });

  test("falls back to the first available variant", () => {
    expect(availableVariantName(mochi, null)).toBe("1 Pcs");
    expect(availableVariantName(mochi, "Isi 8 pcs")).toBe("1 Pcs");
  });

  test("returns null when every variant is sold out, so the order omits the variant", () => {
    const soldOut = mochi.map((variant) => ({ ...variant, isAvailable: false }));
    expect(availableVariantName(soldOut, "1 Pcs")).toBeNull();
  });
});

describe("StickyOrderBar", () => {
  test("truncates a long label and links to the order", () => {
    const html = renderToStaticMarkup(
      <StickyOrderBar label="Authentic Mango Sticky Rice" priceText="Harga menyusul" href="https://wa.me/1" />,
    );
    expect(html).toMatch(/class="[^"]*truncate[^"]*"[^>]*>Authentic Mango Sticky Rice/);
    expect(html).toContain("Harga menyusul");
    expect(html).toContain('href="https://wa.me/1"');
  });
});

describe("ProductGallery", () => {
  test("shows a placeholder when there are no photos", () => {
    expect(renderToStaticMarkup(<ProductGallery images={[]} productName="Mochi" />)).toContain(
      "Foto menyusul",
    );
  });
});

import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AvailabilityBadge } from "./availability-badge";
import { CategoryChips } from "./category-chips";
import { EmptyState } from "./empty-state";
import { ProductCard, type ProductCardData } from "./product-card";

const base: ProductCardData = {
  id: 1,
  slug: "authentic-mango-sticky-rice",
  name: "Authentic Mango Sticky Rice",
  description: "Ketan santan dengan mangga segar.",
  priceCents: 30000,
  imageUrl: null,
  imageAlt: null,
  availability: "available",
  category: { slug: "mango-sticky-rice", name: "Mango Sticky Rice" },
  variants: [],
};

const card = (overrides: Partial<ProductCardData> = {}) =>
  renderToStaticMarkup(<ProductCard product={{ ...base, ...overrides }} waHref="https://wa.me/1" />);

describe("AvailabilityBadge", () => {
  test("always shows the status as text, not only colour", () => {
    expect(renderToStaticMarkup(<AvailabilityBadge availability="preorder" />)).toContain("Pre-Order");
  });
});

describe("ProductCard", () => {
  test("lets a long name wrap and labels the quick-order link with it", () => {
    const html = card();
    expect(html).toMatch(/class="[^"]*break-words[^"]*"[^>]*>(<a[^>]*>)?Authentic Mango Sticky Rice/);
    expect(html).toContain('aria-label="Pesan Authentic Mango Sticky Rice via WhatsApp"');
  });

  test("shows Harga menyusul when there is no price and no variant", () => {
    expect(card({ priceCents: null, variants: [] })).toContain("Harga menyusul");
  });

  test("shows a placeholder instead of an image when there is no photo", () => {
    const html = card({ imageUrl: null });
    expect(html).toContain("Foto menyusul");
    expect(html).not.toContain("<img");
  });

  test("renders the photo with alt text when there is one", () => {
    expect(card({ imageUrl: "https://example.com/m.jpg", imageAlt: "Mango" })).toMatch(/<img[^>]*alt="Mango"/);
  });
});

describe("CategoryChips", () => {
  const items = [
    { slug: "mochi", name: "Mochi" },
    { slug: "slice-cake", name: "Slice Cake" },
  ];

  test("marks the active category as pressed", () => {
    const html = renderToStaticMarkup(<CategoryChips items={items} active="mochi" onSelect={() => {}} />);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Mochi/);
    expect(html).toMatch(/aria-pressed="false"[^>]*>Semua/);
  });

  test("marks Semua as pressed when nothing is selected", () => {
    const html = renderToStaticMarkup(<CategoryChips items={items} onSelect={() => {}} />);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Semua/);
  });
});

describe("EmptyState", () => {
  test("renders its title and action", () => {
    const html = renderToStaticMarkup(
      <EmptyState title="Belum ada produk di sini" description="x" action={<a href="#">Tanya stok</a>} />,
    );
    expect(html).toContain("Belum ada produk di sini");
    expect(html).toContain("Tanya stok");
  });
});

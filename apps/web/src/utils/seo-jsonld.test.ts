import { describe, expect, test } from "bun:test";
import { productJsonLd } from "./seo";

const base = {
  name: "Mille Crepes",
  description: "Kue crepes berlapis.",
  imageUrl: null,
};

describe("productJsonLd", () => {
  test("emits an Offer with the rupiah amount, not cents", () => {
    const ld = productJsonLd({ ...base, priceCents: 16000, slug: "mille-crepes" }, "https://delisert.id");
    const offers = ld.offers as Record<string, unknown>;
    expect(offers.price).toBe(16000);
    expect(offers.priceCurrency).toBe("IDR");
  });

  test("omits offers entirely when the price is unknown", () => {
    // Review Focus #1: a null price must never become Rp 0 in structured data.
    const ld = productJsonLd({ ...base, priceCents: null, slug: "mille-crepes" }, "https://delisert.id");
    expect(ld).not.toHaveProperty("offers");
  });

  test("includes an absolute product URL when a slug is known", () => {
    const ld = productJsonLd({ ...base, priceCents: 16000, slug: "mille-crepes" }, "https://delisert.id");
    expect(ld.url).toBe("https://delisert.id/menu/mille-crepes");
  });
});

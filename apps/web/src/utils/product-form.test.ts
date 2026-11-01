import { describe, expect, test } from "bun:test";
import { EMPTY_FORM, isDirty, toForm, toPayload, validateProductForm } from "./product-form";

const product = {
  name: "Artisanal Mochi Daifuku",
  slug: "artisanal-mochi-daifuku",
  categoryId: 1,
  description: null,
  priceCents: 8000,
  availability: "available" as const,
  isFeatured: true,
  imageUrl: null,
  imageAlt: null,
};

describe("toForm", () => {
  test("turns stored values into form text", () => {
    const form = toForm(product);
    expect(form.price).toBe("8000");
    expect(form.description).toBe("");
    expect(form.imageUrl).toBe("");
  });

  test("leaves the price empty when it has not been set", () => {
    expect(toForm({ ...product, priceCents: null }).price).toBe("");
  });
});

describe("isDirty", () => {
  test("is false for an untouched form", () => {
    expect(isDirty(toForm(product), toForm(product))).toBe(false);
  });

  test("is true once a field changes", () => {
    expect(isDirty(toForm(product), { ...toForm(product), price: "9000" })).toBe(true);
  });
});

describe("toPayload", () => {
  test("trims text and turns empty optionals into null", () => {
    const payload = toPayload({ ...EMPTY_FORM, name: "  Mochi  ", slug: "mochi", categoryId: 2, price: "" });
    expect(payload.name).toBe("Mochi");
    expect(payload.priceCents).toBeNull();
    expect(payload.description).toBeNull();
  });
});

describe("validateProductForm", () => {
  const valid = { ...EMPTY_FORM, name: "Mochi", slug: "mochi", categoryId: 1 as const };

  test("accepts a complete form", () => {
    expect(validateProductForm(valid)).toBeNull();
  });

  test("points slug and category errors at the folded fields so the editor can open them", () => {
    expect(validateProductForm({ ...valid, slug: "Mochi Stroberi" })?.field).toBe("slug");
    expect(validateProductForm({ ...valid, categoryId: "" })?.field).toBe("category");
    expect(validateProductForm({ ...valid, name: " " })?.field).toBe("name");
  });
});

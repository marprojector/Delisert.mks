import { describe, expect, test } from "bun:test";
import { choiceForProduct } from "./variant-picker";

describe("choiceForProduct", () => {
  test("keeps the choice on the product where it was made", () => {
    expect(choiceForProduct({ slug: "slice-cake", name: "Red Velvet" }, "slice-cake")).toBe("Red Velvet");
  });

  test("does not carry a choice over to another product", () => {
    expect(choiceForProduct({ slug: "slice-cake", name: "Red Velvet" }, "mille-crepes")).toBeNull();
    expect(choiceForProduct(null, "mille-crepes")).toBeNull();
  });
});

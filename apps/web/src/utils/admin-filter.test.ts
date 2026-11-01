import { describe, expect, test } from "bun:test";
import { filterProducts } from "./admin-filter";

const rows = [
  { name: "Artisanal Mochi Daifuku", availability: "available" as const },
  { name: "Authentic Mango Sticky Rice", availability: "available" as const },
  { name: "Mille Crepes", availability: "soldout" as const },
  { name: "Pancake Durian Premium", availability: "preorder" as const },
];

describe("filterProducts", () => {
  test("matches part of the name, ignoring case and surrounding spaces", () => {
    expect(filterProducts(rows, "  MANGO ", "all").map((row) => row.name)).toEqual([
      "Authentic Mango Sticky Rice",
    ]);
  });

  test("keeps only the chosen availability", () => {
    expect(filterProducts(rows, "", "soldout").map((row) => row.name)).toEqual(["Mille Crepes"]);
  });

  test("returns everything for an empty query and all statuses", () => {
    expect(filterProducts(rows, "", "all")).toHaveLength(4);
  });
});

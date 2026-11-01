import { describe, expect, test } from "bun:test";
import { formatRupiah, priceToNumber, summariseVariantPrice } from "./price";

describe("formatRupiah", () => {
  test("formats cents as Indonesian rupiah", () => {
    expect(formatRupiah(8000)).toBe("Rp 8.000");
    expect(formatRupiah(30000)).toBe("Rp 30.000");
    expect(formatRupiah(16000)).toBe("Rp 16.000");
    expect(formatRupiah(50000)).toBe("Rp 50.000");
  });

  test("formats seven-digit amounts", () => {
    expect(formatRupiah(1250000)).toBe("Rp 1.250.000");
  });
});

describe("priceToNumber", () => {
  test("returns the rupiah amount for JSON-LD", () => {
    expect(priceToNumber(35000)).toBe(35000);
  });
});

describe("summariseVariantPrice", () => {
  test("returns none when every price is null", () => {
    expect(summariseVariantPrice([null, null])).toEqual({ kind: "none" });
  });

  test("returns none for an empty list", () => {
    expect(summariseVariantPrice([])).toEqual({ kind: "none" });
  });

  test("collapses equal prices to a single value", () => {
    expect(summariseVariantPrice([16000, 16000, 16000])).toEqual({
      kind: "single",
      cents: 16000,
    });
  });

  test("returns a range when prices differ", () => {
    expect(summariseVariantPrice([8000, 30000, 50000])).toEqual({
      kind: "range",
      min: 8000,
      max: 50000,
    });
  });

  test("ignores nulls when other prices exist", () => {
    expect(summariseVariantPrice([null, 16000])).toEqual({ kind: "single", cents: 16000 });
  });
});

import { describe, expect, test } from "bun:test";
import { photoSrcSet, photoVariants } from "./photo";

const ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

describe("photoSrcSet", () => {
  test("lists every standard width up to the stored maximum", () => {
    expect(photoSrcSet(`/api/photos/products/${ID}-w1600.webp`)).toBe(
      `/api/photos/products/${ID}-w480.webp 480w, /api/photos/products/${ID}-w960.webp 960w, /api/photos/products/${ID}-w1600.webp 1600w`,
    );
  });

  test("uses the real width of a photo smaller than 1600px", () => {
    expect(photoVariants(`/api/photos/products/${ID}-w1200.jpg`)?.map((v) => v.width)).toEqual([
      480, 960, 1200,
    ]);
  });

  test("returns nothing for a single small size", () => {
    expect(photoSrcSet(`/api/photos/products/${ID}-w400.webp`)).toBeUndefined();
  });

  test("leaves older photos and external URLs alone", () => {
    expect(photoSrcSet(`/api/photos/products/${ID}.jpg`)).toBeUndefined();
    expect(photoSrcSet("https://example.com/mochi.jpg")).toBeUndefined();
  });
});

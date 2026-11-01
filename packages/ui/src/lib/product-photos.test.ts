import { describe, expect, test } from "bun:test";

import { productPhotos } from "./product-photos";

const SLICE = {
  name: "Slice Cake",
  imageUrl: null,
  useFlavorPhotos: true,
  flavors: [
    { name: "Lotus Biscoff", imageUrl: "/lotus.webp" },
    { name: "Red Velvet", imageUrl: "/red.webp" },
    { name: "Coklat", imageUrl: null },
  ],
};

describe("productPhotos", () => {
  test("auto mode uses every flavour photo when the product has no photo of its own", () => {
    expect(productPhotos(SLICE).map((photo) => photo.url)).toEqual(["/lotus.webp", "/red.webp"]);
    expect(productPhotos(SLICE)[0]!.flavorName).toBe("Lotus Biscoff");
  });

  test("the product's own photo stays first", () => {
    expect(productPhotos({ ...SLICE, imageUrl: "/own.webp" }).map((photo) => photo.url)).toEqual([
      "/own.webp",
      "/lotus.webp",
      "/red.webp",
    ]);
  });

  test("the chosen flavour's photo moves to the front without duplicates", () => {
    expect(productPhotos(SLICE, "Red Velvet").map((photo) => photo.url)).toEqual(["/red.webp", "/lotus.webp"]);
  });

  test("auto mode off: only the product photo, plus the chosen flavour's photo", () => {
    const manual = { ...SLICE, useFlavorPhotos: false, imageUrl: "/own.webp" };
    expect(productPhotos(manual).map((photo) => photo.url)).toEqual(["/own.webp"]);
    expect(productPhotos(manual, "Lotus Biscoff").map((photo) => photo.url)).toEqual(["/lotus.webp", "/own.webp"]);
    expect(productPhotos({ ...manual, imageUrl: null })).toEqual([]);
  });
});

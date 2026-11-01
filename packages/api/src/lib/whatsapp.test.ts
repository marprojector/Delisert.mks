import { describe, expect, test } from "bun:test";
import { productOrderMessage, waLink } from "./whatsapp";

describe("productOrderMessage", () => {
  test("names the product and asks about availability", () => {
    expect(productOrderMessage({ productName: "Mille Crepes" })).toBe(
      "Halo Delisert, saya ingin memesan Mille Crepes. Apakah masih tersedia?",
    );
  });

  test("includes the chosen variant", () => {
    expect(
      productOrderMessage({ productName: "Artisanal Mochi Daifuku", variantName: "Isi 4 pcs" }),
    ).toBe(
      "Halo Delisert, saya ingin memesan Artisanal Mochi Daifuku (Isi 4 pcs). Apakah masih tersedia?",
    );
  });
});

describe("waLink", () => {
  test("targets the business number and encodes the message", () => {
    const link = waLink("Halo Delisert, saya ingin memesan.");
    expect(link.startsWith("https://wa.me/6285190021421?text=")).toBe(true);
    expect(link).not.toContain(" ");
  });
});

describe("order message with flavour", () => {
  test("mentions the size and the flavour", () => {
    expect(
      productOrderMessage({ productName: "Artisanal Mochi Daifuku", variantName: "Isi 4 pcs", flavorName: "Matcha Oreo" }),
    ).toBe("Halo Delisert, saya ingin memesan Artisanal Mochi Daifuku (Isi 4 pcs, rasa Matcha Oreo). Apakah masih tersedia?");
    expect(productOrderMessage({ productName: "Mille Crepes", flavorName: "Coklat" })).toBe(
      "Halo Delisert, saya ingin memesan Mille Crepes (rasa Coklat). Apakah masih tersedia?",
    );
  });
});

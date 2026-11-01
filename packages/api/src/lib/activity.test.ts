import { describe, expect, test } from "bun:test";

import { describeActivity } from "./activity";

describe("activity", () => {
  test("describes changes in plain Indonesian", () => {
    expect(describeActivity("adminProduct.create", { name: "Mochi Matcha" })?.summary).toBe(
      "Menambah produk “Mochi Matcha”",
    );
    expect(describeActivity("adminProduct.setAvailability", { id: 3, availability: "soldout" })?.summary).toBe(
      "Menandai produk #3 Habis",
    );
    expect(
      describeActivity("adminProduct.setAvailability", { id: 3, availability: "soldout" }, { product: "Mille Crepes" })
        ?.summary,
    ).toBe("Menandai “Mille Crepes” Habis");
    expect(describeActivity("adminSite.update", { section: "home", value: {} })?.summary).toBe(
      "Mengubah konten Beranda",
    );
  });

  test("skips actions that are not worth logging", () => {
    expect(describeActivity("adminProduct.discardPhoto", { url: "x" })).toBeNull();
    expect(describeActivity("adminAuth.login", {})).toBeNull();
  });
});

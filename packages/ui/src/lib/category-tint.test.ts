import { describe, expect, test } from "bun:test";
import { categoryTint } from "./category-tint";

describe("categoryTint", () => {
  test("gives each known category its own placeholder tint", () => {
    expect(categoryTint("mochi")).toBe("bg-[#e8cfc0]");
    expect(categoryTint("dubai-chewy-cookie")).toBe("bg-[#d8b98f]");
  });

  test("falls back to the secondary token for unknown or missing slugs", () => {
    expect(categoryTint("wholecake")).toBe("bg-secondary");
    expect(categoryTint(undefined)).toBe("bg-secondary");
  });
});

import { describe, expect, test } from "bun:test";
import { canonical, joinOrigin } from "./seo";

describe("joinOrigin", () => {
  test("joins an origin and a path", () => {
    expect(joinOrigin("https://delisert.id", "/menu")).toBe("https://delisert.id/menu");
  });

  test("does not double the slash", () => {
    expect(joinOrigin("https://delisert.id/", "/menu")).toBe("https://delisert.id/menu");
  });

  test("adds a leading slash to a bare path", () => {
    expect(joinOrigin("https://delisert.id", "menu")).toBe("https://delisert.id/menu");
  });
});

describe("canonical", () => {
  test("uses the configured origin", () => {
    expect(canonical("/jadwal", "https://delisert.id")).toBe("https://delisert.id/jadwal");
  });
});

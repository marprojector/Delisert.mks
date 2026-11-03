import { describe, expect, test } from "bun:test";

import { canonicalRedirect } from "./canonical-host";

const OLD = "https://delisert-mks-1-web-production-6y36ruv763nrxrqt.badryansah99.workers.dev";

describe("canonicalRedirect", () => {
  test("pages on the old workers.dev address go to delisert.me, keeping path and query", () => {
    expect(canonicalRedirect(new Request(`${OLD}/menu?category=mochi`))).toBe("https://delisert.me/menu?category=mochi");
    expect(canonicalRedirect(new Request(`${OLD}/`))).toBe("https://delisert.me/");
  });

  test("API calls and non-GET requests on the old address keep working", () => {
    expect(canonicalRedirect(new Request(`${OLD}/api/trpc/product.list`))).toBeNull();
    expect(canonicalRedirect(new Request(`${OLD}/api/mcp`, { method: "POST", body: "{}" }))).toBeNull();
    expect(canonicalRedirect(new Request(`${OLD}/admin`, { method: "POST", body: "x" }))).toBeNull();
  });

  test("delisert.me itself and local development are never redirected", () => {
    expect(canonicalRedirect(new Request("https://delisert.me/menu"))).toBeNull();
    expect(canonicalRedirect(new Request("http://localhost:3001/menu"))).toBeNull();
  });
});

import { describe, expect, test } from "bun:test";
import { analyticsScripts } from "./analytics";

describe("analyticsScripts", () => {
  test("loads nothing until a token is configured", () => {
    expect(analyticsScripts(null)).toEqual([]);
  });

  test("loads the Cloudflare beacon with the token", () => {
    expect(analyticsScripts("abc123")).toEqual([
      {
        src: "https://static.cloudflareinsights.com/beacon.min.js",
        defer: true,
        "data-cf-beacon": '{"token":"abc123"}',
      },
    ]);
  });
});

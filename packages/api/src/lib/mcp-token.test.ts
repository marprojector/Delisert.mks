import { describe, expect, test } from "bun:test";

import { bearerMcpToken, displayPrefix, generateMcpToken, hashMcpToken } from "./mcp-token";

describe("mcp token", () => {
  test("tokens are random, prefixed and long enough", () => {
    const a = generateMcpToken();
    const b = generateMcpToken();
    expect(a).not.toBe(b);
    expect(a.startsWith("dlsrt_")).toBe(true);
    expect(a.length).toBeGreaterThanOrEqual(48);
  });

  test("hash is stable SHA-256 hex and never equals the token", async () => {
    const token = generateMcpToken();
    const hash = await hashMcpToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashMcpToken(token)).toBe(hash);
    expect(hash).not.toContain(token);
  });

  test("display prefix shows only a few characters", () => {
    expect(displayPrefix("dlsrt_abcdefghijklmnop")).toBe("dlsrt_abcdef");
  });

  test("reads only well-formed bearer tokens", () => {
    const token = generateMcpToken();
    expect(bearerMcpToken(`Bearer ${token}`)).toBe(token);
    expect(bearerMcpToken(`bearer ${token}`)).toBe(token);
    expect(bearerMcpToken("Bearer abc")).toBeNull();
    expect(bearerMcpToken(undefined)).toBeNull();
  });
});

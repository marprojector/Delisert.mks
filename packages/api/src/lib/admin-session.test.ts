import { describe, expect, test } from "bun:test";
import { createSessionToken, SESSION_TTL_MS, verifySessionToken } from "./admin-session";

const SECRET = "test-secret-value";
const NOW = 1_800_000_000_000;

describe("admin session", () => {
  test("accepts a token it just issued", async () => {
    const token = await createSessionToken(SECRET, NOW, SESSION_TTL_MS);
    expect(await verifySessionToken(SECRET, token, NOW + 1000)).toBe(true);
  });

  test("rejects an expired token", async () => {
    const token = await createSessionToken(SECRET, NOW, 1000);
    expect(await verifySessionToken(SECRET, token, NOW + 2000)).toBe(false);
  });

  test("rejects a token signed with another secret", async () => {
    const token = await createSessionToken("other-secret", NOW, SESSION_TTL_MS);
    expect(await verifySessionToken(SECRET, token, NOW)).toBe(false);
  });

  test("rejects a tampered expiry", async () => {
    const token = await createSessionToken(SECRET, NOW, 1000);
    const [payload, signature] = token.split(".");
    const decoded = JSON.parse(atob(payload!.replace(/-/g, "+").replace(/_/g, "/")));
    decoded.exp = NOW + SESSION_TTL_MS;
    const forged = `${btoa(JSON.stringify(decoded)).replace(/=+$/, "")}.${signature}`;
    expect(await verifySessionToken(SECRET, forged, NOW)).toBe(false);
  });

  test("rejects malformed input without throwing", async () => {
    expect(await verifySessionToken(SECRET, "", NOW)).toBe(false);
    expect(await verifySessionToken(SECRET, "not-a-token", NOW)).toBe(false);
    expect(await verifySessionToken(SECRET, "a.b.c", NOW)).toBe(false);
  });
});

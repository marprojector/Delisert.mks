import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("upload endpoint", () => {
  test("rejects an anonymous request", async () => {
    const response = await fetch(`${BASE}/api/upload`, { method: "POST" });
    expect(response.status).toBe(401);
  });

  test("rejects a forged token", async () => {
    const response = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { authorization: "Bearer forged.signature" },
    });
    expect(response.status).toBe(401);
  });
});

describe("photo proxy", () => {
  test("is gone — photos are served by Supabase, not this app", async () => {
    const response = await fetch(`${BASE}/api/photos/products/anything.png`);
    expect(response.status).toBe(404);
  });
});

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

describe("photo endpoint", () => {
  test("refuses keys outside the products prefix", async () => {
    const response = await fetch(`${BASE}/api/photos/secrets.json`);
    expect(response.status).toBe(404);
  });

  test("refuses traversal in the key", async () => {
    const response = await fetch(`${BASE}/api/photos/products/..%2F..%2Fsecrets`);
    expect(response.status).toBe(404);
  });

  test("refuses malformed percent encoding", async () => {
    const response = await fetch(`${BASE}/api/photos/%E0%A4%A`);
    expect([400, 404]).toContain(response.status);
  });
});

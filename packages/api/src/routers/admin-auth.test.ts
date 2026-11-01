import { describe, expect, test } from "bun:test";
import { appRouter } from "./index";

const SECRET = "test-secret";
const PASSWORD = "correct-horse";

const ctx = (authorization?: string) => ({
  db: null as never,
  adminSecret: SECRET,
  adminPassword: PASSWORD,
  authorization,
});

describe("admin auth", () => {
  test("rejects a wrong password", async () => {
    const caller = appRouter.createCaller(ctx());
    await expect(caller.adminAuth.login({ password: "wrong" })).rejects.toThrow();
  });

  test("issues a token for the right password", async () => {
    const caller = appRouter.createCaller(ctx());
    const result = await caller.adminAuth.login({ password: PASSWORD });
    expect(typeof result.token).toBe("string");
    expect(result.token).toContain(".");
  });

  test("session is false without a token", async () => {
    const caller = appRouter.createCaller(ctx());
    expect(await caller.adminAuth.session()).toEqual({ authenticated: false });
  });

  test("session is true with a token from login", async () => {
    const anon = appRouter.createCaller(ctx());
    const { token } = await anon.adminAuth.login({ password: PASSWORD });
    const authed = appRouter.createCaller(ctx(`Bearer ${token}`));
    expect(await authed.adminAuth.session()).toEqual({ authenticated: true });
  });
});

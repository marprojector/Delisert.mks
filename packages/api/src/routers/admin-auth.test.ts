import { describe, expect, test } from "bun:test";
import { LoginLimiter, passwordsMatch } from "../lib/login-guard";
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

describe("admin login guard", () => {
  test("locks a client out after repeated wrong passwords", async () => {
    const loginLimiter = new LoginLimiter(3, 60_000);
    const caller = appRouter.createCaller({ ...ctx(), clientIp: "1.2.3.4", loginLimiter });
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(caller.adminAuth.login({ password: "wrong" })).rejects.toThrow("Kata sandi salah");
    }
    // Even the right password is refused while locked out.
    await expect(caller.adminAuth.login({ password: PASSWORD })).rejects.toThrow(
      "Terlalu banyak percobaan",
    );
    // Another client is unaffected.
    const other = appRouter.createCaller({ ...ctx(), clientIp: "5.6.7.8", loginLimiter });
    expect(typeof (await other.adminAuth.login({ password: PASSWORD })).token).toBe("string");
  });

  test("parallel wrong guesses cannot get past the attempt limit", async () => {
    const loginLimiter = new LoginLimiter(5, 60_000);
    const caller = appRouter.createCaller({ ...ctx(), clientIp: "7.7.7.7", loginLimiter });
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () => caller.adminAuth.login({ password: "wrong" })),
    );
    const checked = results.filter(
      (result) => result.status === "rejected" && String(result.reason).includes("Kata sandi salah"),
    );
    expect(checked.length).toBe(5);
  });

  test("a correct password still works after a wrong one and clears the counter", async () => {
    const loginLimiter = new LoginLimiter(5, 60_000);
    const caller = appRouter.createCaller({ ...ctx(), clientIp: "8.8.8.8", loginLimiter });
    await expect(caller.adminAuth.login({ password: "wrong" })).rejects.toThrow();
    expect(typeof (await caller.adminAuth.login({ password: PASSWORD })).token).toBe("string");
    expect(loginLimiter.remaining("8.8.8.8", Date.now())).toBe(5);
  });

  test("tells the client how many attempts are left before the lockout", async () => {
    const loginLimiter = new LoginLimiter(5, 60_000);
    const caller = appRouter.createCaller({ ...ctx(), clientIp: "9.9.9.9", loginLimiter });
    await expect(caller.adminAuth.login({ password: "wrong" })).rejects.toThrow("Sisa 4 percobaan");
    await expect(caller.adminAuth.login({ password: "wrong" })).rejects.toThrow("Sisa 3 percobaan");
  });

  test("refuses to log in when the admin secrets are not configured", async () => {
    const caller = appRouter.createCaller({ ...ctx(), adminPassword: "", adminSecret: "" });
    await expect(caller.adminAuth.login({ password: "anything" })).rejects.toThrow(
      "Admin belum dikonfigurasi",
    );
  });
});

describe("passwordsMatch", () => {
  test("matches equal strings only", async () => {
    expect(await passwordsMatch("abc", "abc")).toBe(true);
    expect(await passwordsMatch("abc", "abd")).toBe(false);
    expect(await passwordsMatch("abc", "abcd")).toBe(false);
  });
});

describe("LoginLimiter lockout", () => {
  test("a lockout lasts the full window from the moment it starts", () => {
    const limiter = new LoginLimiter(5, 60_000);
    limiter.recordFailure("ip", 0);
    for (let i = 0; i < 4; i += 1) limiter.recordFailure("ip", 59_000);
    // Jendela lama berakhir di 60 detik, tetapi kunci harus tetap 60 detik sejak 59 detik.
    expect(limiter.retryAfterMs("ip", 60_500)).toBeGreaterThan(55_000);
    expect(limiter.retryAfterMs("ip", 119_500)).toBe(0);
  });
});

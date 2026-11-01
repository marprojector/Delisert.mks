import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { SESSION_TTL_MS, createSessionToken, verifySessionToken } from "../lib/admin-session";
import { loginLimiter, passwordsMatch } from "../lib/login-guard";

export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      // Rahasia kosong berarti deploy salah konfigurasi. Katakan itu dengan
      // jelas, jangan biarkan importKey melempar error 500 yang membingungkan.
      if (!ctx.adminPassword || !ctx.adminSecret) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Admin belum dikonfigurasi: ADMIN_PASSWORD atau ADMIN_SESSION_SECRET kosong.",
        });
      }

      const limiter = ctx.loginLimiter ?? loginLimiter;
      const clientKey = ctx.clientIp ?? "unknown";
      const now = Date.now();

      const waitMs = limiter.retryAfterMs(clientKey, now);
      if (waitMs > 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(waitMs / 60_000)} menit.`,
        });
      }

      if (!(await passwordsMatch(input.password, ctx.adminPassword))) {
        limiter.recordFailure(clientKey, now);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Kata sandi salah." });
      }

      limiter.reset(clientKey);
      return { token: await createSessionToken(ctx.adminSecret, now, SESSION_TTL_MS) };
    }),

  // Token bersifat stateless: logout cukup membuang token di sisi klien.
  logout: publicProcedure.mutation(() => ({ ok: true as const })),

  session: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.authorization?.replace(/^Bearer\s+/i, "");
    const authenticated = Boolean(
      token && (await verifySessionToken(ctx.adminSecret, token, Date.now())),
    );
    return { authenticated };
  }),
});

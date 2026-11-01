import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { SESSION_TTL_MS, createSessionToken, verifySessionToken } from "../lib/admin-session";

export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (input.password !== ctx.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Kata sandi salah." });
      }
      return { token: await createSessionToken(ctx.adminSecret, Date.now(), SESSION_TTL_MS) };
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

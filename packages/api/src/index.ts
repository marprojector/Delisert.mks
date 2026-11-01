import { TRPCError, initTRPC } from "@trpc/server";

import type { Context } from "./context";
import { verifySessionToken } from "./lib/admin-session";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

/**
 * Prosedur yang hanya boleh dipanggil dengan token sesi admin yang sah.
 * Ini adalah batas keamanan sebenarnya — redirect di sisi klien hanya UX.
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  const token = ctx.authorization?.replace(/^Bearer\s+/i, "");

  if (!token || !(await verifySessionToken(ctx.adminSecret, token, Date.now()))) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Silakan login sebagai admin.",
    });
  }

  return next({ ctx });
});

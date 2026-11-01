import { TRPCError, initTRPC } from "@trpc/server";

import type { Context } from "./context";
import { activityLog } from "@delisert.mks-1/db/schema/index";

import { describeActivity, resolveActivityNames } from "./lib/activity";
import { verifySessionToken } from "./lib/admin-session";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

/**
 * Prosedur yang hanya boleh dipanggil dengan token sesi admin yang sah.
 * Ini adalah batas keamanan sebenarnya — redirect di sisi klien hanya UX.
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next, type, path, getRawInput }) => {
  const token = ctx.authorization?.replace(/^Bearer\s+/i, "");

  if (!token || !(await verifySessionToken(ctx.adminSecret, token, Date.now()))) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Silakan login sebagai admin.",
    });
  }

  // Nama yang dirujuk dicari sebelum perubahan berjalan (bisa saja dihapus).
  const names =
    type === "mutation" ? await resolveActivityNames(ctx.db, path, await getRawInput().catch(() => null)) : {};

  const result = await next({ ctx });

  // Catat perubahan yang berhasil. Log bersifat pelengkap: gagal mencatat
  // tidak boleh menggagalkan perubahan yang sudah tersimpan.
  if (result.ok && type === "mutation") {
    try {
      const entry = describeActivity(path, await getRawInput(), names);
      if (entry) {
        await ctx.db.insert(activityLog).values({ actor: ctx.actor ?? "admin", ...entry });
      }
    } catch {
      // abaikan
    }
  }

  return result;
});

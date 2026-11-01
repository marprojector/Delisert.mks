import { activityLog, mcpTokens } from "@delisert.mks-1/db/schema/index";
import { TRPCError } from "@trpc/server";
import { desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";
import { displayPrefix, generateMcpToken, hashMcpToken } from "../lib/mcp-token";
import { AnalyticsError, fetchAnalytics } from "../lib/web-analytics";

export const adminAnalyticsRouter = router({
  /**
   * Ringkasan pengunjung dari Cloudflare Web Analytics. Tidak melempar error
   * ke klien untuk masalah konfigurasi — dashboard menampilkan statusnya.
   */
  summary: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(7) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.analytics) return { status: "unconfigured" as const };
      try {
        const summary = await fetchAnalytics(ctx.analytics, input.days, Date.now(), ctx.fetch ?? fetch);
        return { status: "ok" as const, summary };
      } catch (error) {
        return {
          status: "error" as const,
          message: error instanceof AnalyticsError ? error.message : "Gagal menghubungi Cloudflare.",
        };
      }
    }),
});

export const adminActivityRouter = router({
  list: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }).default({ limit: 20 }))
    .query(({ ctx, input }) =>
      ctx.db.select().from(activityLog).orderBy(desc(activityLog.id)).limit(input.limit),
    ),
});

const publicToken = {
  id: mcpTokens.id,
  name: mcpTokens.name,
  tokenPrefix: mcpTokens.tokenPrefix,
  scope: mcpTokens.scope,
  createdAt: mcpTokens.createdAt,
  lastUsedAt: mcpTokens.lastUsedAt,
  revokedAt: mcpTokens.revokedAt,
};

export const adminMcpRouter = router({
  list: adminProcedure.query(({ ctx }) =>
    ctx.db.select(publicToken).from(mcpTokens).orderBy(desc(mcpTokens.id)),
  ),

  /** Token mentah dikembalikan SEKALI di sini dan tidak bisa dilihat lagi. */
  create: adminProcedure
    .input(z.object({ name: z.string().trim().min(1).max(60), scope: z.enum(["read", "write"]) }))
    .mutation(async ({ ctx, input }) => {
      const token = generateMcpToken();
      const [row] = await ctx.db
        .insert(mcpTokens)
        .values({
          name: input.name,
          scope: input.scope,
          tokenHash: await hashMcpToken(token),
          tokenPrefix: displayPrefix(token),
        })
        .returning(publicToken);
      return { ...row!, token };
    }),

  revoke: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(mcpTokens)
        .set({ revokedAt: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(mcpTokens.id, input.id))
        .returning({ id: mcpTokens.id });
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Token tidak ditemukan." });
      return { ok: true as const };
    }),
});

/** Cari token MCP aktif dari token mentah; catat waktu pemakaian terakhir. */
export async function authenticateMcpToken(
  db: import("@delisert.mks-1/db").Database,
  token: string,
): Promise<{ id: number; name: string; scope: "read" | "write" } | null> {
  const [row] = await db
    .select({ id: mcpTokens.id, name: mcpTokens.name, scope: mcpTokens.scope })
    .from(mcpTokens)
    .where(sql`${mcpTokens.tokenHash} = ${await hashMcpToken(token)} and ${isNull(mcpTokens.revokedAt)}`)
    .limit(1);
  if (!row) return null;
  await db
    .update(mcpTokens)
    .set({ lastUsedAt: sql`(CURRENT_TIMESTAMP)` })
    .where(eq(mcpTokens.id, row.id));
  return { ...row, scope: row.scope === "write" ? "write" : "read" };
}

import { siteSettings } from "@delisert.mks-1/db/schema/index";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import type { Context } from "../context";
import { adminProcedure, publicProcedure, router } from "../index";
import { type SiteContent, resolveSiteContent, siteContentSchema } from "../lib/site-content";

export const sectionEnum = z.enum(["brand", "home", "schedule", "about", "contact"]);

export async function loadSiteContent(ctx: Pick<Context, "db">): Promise<SiteContent> {
  const rows = await ctx.db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings);
  return resolveSiteContent(rows);
}

/** Simpan satu bagian konten (lengkap) setelah divalidasi. */
export async function saveSiteSection(
  ctx: Pick<Context, "db">,
  section: z.infer<typeof sectionEnum>,
  value: unknown,
): Promise<SiteContent> {
  const parsed = siteContentSchema.shape[section].safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${issue?.path.join(".") || section}: ${issue?.message ?? "isian tidak valid"}`,
    });
  }
  const json = JSON.stringify(parsed.data);
  await ctx.db
    .insert(siteSettings)
    .values({ key: section, value: json })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: json, updatedAt: sql`(CURRENT_TIMESTAMP)` },
    });
  return loadSiteContent(ctx);
}

export const siteRouter = router({
  /** Konten website untuk halaman publik. Selalu lengkap (bawaan + ubahan pemilik). */
  content: publicProcedure.query(({ ctx }) => loadSiteContent(ctx)),
});

export const adminSiteRouter = router({
  content: adminProcedure.query(({ ctx }) => loadSiteContent(ctx)),

  update: adminProcedure
    .input(z.object({ section: sectionEnum, value: z.unknown() }))
    .mutation(({ ctx, input }) => saveSiteSection(ctx, input.section, input.value)),

  reset: adminProcedure
    .input(z.object({ section: sectionEnum }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(siteSettings).where(eq(siteSettings.key, input.section));
      return loadSiteContent(ctx);
    }),
});

import { productCategories, products } from "@delisert.mks-1/db/schema/index";
import { TRPCError } from "@trpc/server";
import { asc, count, eq, max } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";
import { moveInOrder } from "../lib/reorder";

const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");

const fields = {
  name: z.string().trim().min(1).max(60),
  slug: slugSchema,
  description: z.string().trim().max(400).nullable().optional(),
  isActive: z.boolean(),
};

const isUniqueViolation = (error: unknown) => {
  const text = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}` : "";
  return /UNIQUE constraint failed/i.test(text);
};

const slugTaken = () => new TRPCError({ code: "CONFLICT", message: "Slug kategori sudah dipakai." });

export const adminCategoryRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    const [rows, counts] = await Promise.all([
      ctx.db
        .select()
        .from(productCategories)
        .orderBy(asc(productCategories.displayOrder), asc(productCategories.id)),
      ctx.db
        .select({ categoryId: products.categoryId, total: count() })
        .from(products)
        .groupBy(products.categoryId),
    ]);
    const totals = new Map(counts.map((row) => [row.categoryId, row.total]));
    return rows.map((row) => ({ ...row, productCount: totals.get(row.id) ?? 0 }));
  }),

  create: adminProcedure
    .input(z.object({ ...fields, isActive: fields.isActive.default(true) }))
    .mutation(async ({ ctx, input }) => {
      const [last] = await ctx.db.select({ value: max(productCategories.displayOrder) }).from(productCategories);
      try {
        const [row] = await ctx.db
          .insert(productCategories)
          .values({ ...input, description: input.description ?? null, displayOrder: (last?.value ?? -1) + 1 })
          .returning();
        return row!;
      } catch (error) {
        if (isUniqueViolation(error)) throw slugTaken();
        throw error;
      }
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int().positive(), ...fields }).partial().required({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...changes } = input;
      try {
        const [row] = await ctx.db
          .update(productCategories)
          .set(changes)
          .where(eq(productCategories.id, id))
          .returning();
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Kategori tidak ditemukan." });
        return row;
      } catch (error) {
        if (isUniqueViolation(error)) throw slugTaken();
        throw error;
      }
    }),

  move: adminProcedure
    .input(z.object({ id: z.number().int().positive(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({ id: productCategories.id })
        .from(productCategories)
        .orderBy(asc(productCategories.displayOrder), asc(productCategories.id));
      const order = moveInOrder(rows.map((row) => row.id), input.id, input.direction);
      if (!order) return { moved: false };
      for (const item of order) {
        await ctx.db
          .update(productCategories)
          .set({ displayOrder: item.displayOrder })
          .where(eq(productCategories.id, item.id));
      }
      return { moved: true };
    }),

  remove: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [used] = await ctx.db
        .select({ total: count() })
        .from(products)
        .where(eq(products.categoryId, input.id));
      if ((used?.total ?? 0) > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Kategori masih dipakai ${used!.total} produk. Pindahkan produknya dulu, atau nonaktifkan kategori.`,
        });
      }
      await ctx.db.delete(productCategories).where(eq(productCategories.id, input.id));
      return { ok: true as const };
    }),
});

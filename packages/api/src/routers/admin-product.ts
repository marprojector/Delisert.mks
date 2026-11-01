import { and, asc, count, eq, ne } from "drizzle-orm";
import { z } from "zod";

import {
  productCategories,
  productVariants,
  products,
} from "@delisert.mks-1/db/schema/index";
import { TRPCError } from "@trpc/server";

import type { Context } from "../context";
import { adminProcedure, router } from "../index";
import { photoKeysForUrl } from "../lib/image";

const availabilityEnum = z.enum(["available", "preorder", "soldout"]);

/** Slug URL-friendly: huruf kecil, angka, dan tanda hubung tunggal. */
const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");

const imageUrlSchema = z
  .string()
  .refine(
    (value) => value.startsWith("/api/photos/products/") || /^https:\/\//.test(value),
    "URL foto harus berupa path foto internal atau URL HTTPS.",
  );

const productFields = {
  categoryId: z.number().int().positive(),
  slug: slugSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0).nullable(),
  imageUrl: imageUrlSchema.nullable().optional(),
  imageAlt: z.string().max(200).nullable().optional(),
  isFeatured: z.boolean(),
  availability: availabilityEnum,
  displayOrder: z.number().int().min(0),
};

const productInput = z.object({
  ...productFields,
  isFeatured: productFields.isFeatured.default(false),
  availability: productFields.availability.default("available"),
  displayOrder: productFields.displayOrder.default(0),
});

const productUpdateInput = z.object(productFields).partial();

const variantInput = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1).max(80),
  priceCents: z.number().int().min(0).nullable(),
  isAvailable: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

const errorText = (error: unknown): string => {
  if (!(error instanceof Error)) return "";
  const cause = "cause" in error ? error.cause : undefined;
  return `${error.message} ${cause instanceof Error ? cause.message : ""}`;
};

const isUniqueViolation = (error: unknown): boolean =>
  /UNIQUE constraint failed/i.test(errorText(error));

/**
 * Hapus foto R2 yang tidak dipakai lagi, termasuk semua ukurannya. Hanya
 * foto unggahan sendiri (/api/photos/products/...) yang dihapus; URL HTTPS
 * eksternal dibiarkan.
 * Gagal menghapus tidak boleh menggagalkan simpan/hapus produk.
 */
async function deleteUnusedPhoto(
  ctx: Context,
  url: string | null | undefined,
  productId: number | null,
): Promise<void> {
  if (!ctx.deletePhoto || !url) return;
  // Seluruhnya di dalam try: data produk sudah tersimpan saat ini dipanggil,
  // jadi error di sini tidak boleh membuat simpan dilaporkan gagal.
  try {
    // Produk lain masih memakai foto yang sama? Biarkan di R2.
    const stillUsed = await ctx.db
      .select({ id: products.id })
      .from(products)
      .where(
        productId === null
          ? eq(products.imageUrl, url)
          : and(eq(products.imageUrl, url), ne(products.id, productId)),
      )
      .get();
    if (stillUsed) return;
    await Promise.all(photoKeysForUrl(url).map((key) => ctx.deletePhoto!(key)));
  } catch {
    /* objek yatim lebih baik daripada simpan yang gagal */
  }
}

export const adminProductRouter = router({
  /**
   * Buang foto yang sudah diunggah tetapi tidak jadi dipakai (diganti lagi
   * sebelum disimpan, dibatalkan, atau ditinggal). Foto yang masih dipakai
   * produk mana pun tidak pernah dihapus.
   */
  discardPhoto: adminProcedure
    .input(z.object({ url: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      await deleteUnusedPhoto(ctx, input.url, null);
      return { ok: true as const };
    }),

  categories: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: productCategories.id,
        slug: productCategories.slug,
        name: productCategories.name,
        // Kategori nonaktif ikut dikirim agar editor bisa menampilkan
        // kategori produk saat ini; pilihan baru hanya dari yang aktif.
        isActive: productCategories.isActive,
      })
      .from(productCategories)
      .orderBy(asc(productCategories.displayOrder), asc(productCategories.id));
  }),

  list: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        priceCents: products.priceCents,
        availability: products.availability,
        isFeatured: products.isFeatured,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        categoryName: productCategories.name,
        displayOrder: products.displayOrder,
      })
      .from(products)
      .innerJoin(productCategories, eq(products.categoryId, productCategories.id))
      .orderBy(asc(products.displayOrder), asc(products.id));

    const counts = await ctx.db
      .select({ productId: productVariants.productId, total: count() })
      .from(productVariants)
      .groupBy(productVariants.productId);
    const variantCount = new Map(counts.map((row) => [row.productId, row.total]));

    return rows.map((row) => ({
      ...row,
      availability: availabilityEnum.parse(row.availability),
      variantCount: variantCount.get(row.id) ?? 0,
    }));
  }),

  byId: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.select().from(products).where(eq(products.id, input.id)).get();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Produk tidak ditemukan." });

      const variants = await ctx.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, input.id))
        .orderBy(asc(productVariants.displayOrder), asc(productVariants.id));

      return {
        ...row,
        availability: availabilityEnum.parse(row.availability),
        variants,
      };
    }),

  create: adminProcedure.input(productInput).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.insert(products).values(input).returning().get();
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug sudah dipakai produk lain.",
        });
      }
      throw error;
    }
  }),

  update: adminProcedure
    .input(productUpdateInput.extend({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...changes } = input;
      if (Object.keys(changes).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tidak ada perubahan." });
      }

      const before =
        changes.imageUrl !== undefined
          ? await ctx.db
              .select({ imageUrl: products.imageUrl })
              .from(products)
              .where(eq(products.id, id))
              .get()
          : undefined;

      try {
        const updated = await ctx.db
          .update(products)
          .set(changes)
          .where(eq(products.id, id))
          .returning()
          .get();
        if (!updated) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Produk tidak ditemukan." });
        }
        if (before?.imageUrl && before.imageUrl !== updated.imageUrl) {
          await deleteUnusedPhoto(ctx, before.imageUrl, id);
        }
        return updated;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TRPCError({ code: "CONFLICT", message: "Slug sudah dipakai produk lain." });
        }
        throw error;
      }
    }),

  remove: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(productVariants).where(eq(productVariants.productId, input.id));
      const deleted = await ctx.db
        .delete(products)
        .where(eq(products.id, input.id))
        .returning()
        .get();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produk tidak ditemukan." });
      }
      await deleteUnusedPhoto(ctx, deleted.imageUrl, input.id);
      return { ok: true as const };
    }),

  setAvailability: adminProcedure
    .input(
      z.object({ id: z.number().int().positive(), availability: availabilityEnum }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(products)
        .set({ availability: input.availability })
        .where(eq(products.id, input.id))
        .returning()
        .get();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produk tidak ditemukan." });
      }
      return updated;
    }),

  addVariant: adminProcedure.input(variantInput).mutation(async ({ ctx, input }) => {
    return ctx.db.insert(productVariants).values(input).returning().get();
  }),

  updateVariant: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(80).optional(),
        priceCents: z.number().int().min(0).nullable().optional(),
        isAvailable: z.boolean().optional(),
        displayOrder: z.number().int().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...changes } = input;
      if (Object.keys(changes).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tidak ada perubahan." });
      }
      const updated = await ctx.db
        .update(productVariants)
        .set(changes)
        .where(eq(productVariants.id, id))
        .returning()
        .get();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Varian tidak ditemukan." });
      }
      return updated;
    }),

  removeVariant: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(productVariants)
        .where(eq(productVariants.id, input.id))
        .returning()
        .get();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Varian tidak ditemukan." });
      }
      return { ok: true as const };
    }),
});

import { and, asc, count, eq, isNotNull, ne } from "drizzle-orm";
import { z } from "zod";

import {
  productCategories,
  productFlavors,
  productVariants,
  products,
} from "@delisert.mks-1/db/schema/index";
import { TRPCError } from "@trpc/server";

import type { Context } from "../context";
import { adminProcedure, router } from "../index";
import { photoKeysForUrl } from "../lib/image";
import { moveInOrder } from "../lib/reorder";

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
  /** Kartu & galeri memakai foto tiap rasa; foto produk sendiri jadi opsional. */
  useFlavorPhotos: z.boolean(),
  availability: availabilityEnum,
  displayOrder: z.number().int().min(0),
};

const productInput = z.object({
  ...productFields,
  isFeatured: productFields.isFeatured.default(false),
  useFlavorPhotos: productFields.useFlavorPhotos.default(false),
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
  /** Rasa yang fotonya sedang diganti/dihapus (tidak dihitung sebagai pemakai). */
  flavorId: number | null = null,
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
    // Foto rasa juga dihitung sebagai pemakai.
    const usedByFlavor = await ctx.db
      .select({ id: productFlavors.id })
      .from(productFlavors)
      .where(
        flavorId === null
          ? eq(productFlavors.imageUrl, url)
          : and(eq(productFlavors.imageUrl, url), ne(productFlavors.id, flavorId)),
      )
      .get();
    if (usedByFlavor) return;
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
        useFlavorPhotos: products.useFlavorPhotos,
        imageUrl: products.imageUrl,
        description: products.description,
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
    const flavorCounts = await ctx.db
      .select({ productId: productFlavors.productId, total: count() })
      .from(productFlavors)
      .groupBy(productFlavors.productId);
    const flavorCount = new Map(flavorCounts.map((row) => [row.productId, row.total]));
    // Foto rasa pertama, untuk thumbnail produk yang memakai foto otomatis dari rasa.
    const flavorPhotoRows = await ctx.db
      .select({ productId: productFlavors.productId, imageUrl: productFlavors.imageUrl })
      .from(productFlavors)
      .where(isNotNull(productFlavors.imageUrl))
      .orderBy(asc(productFlavors.displayOrder), asc(productFlavors.id));
    const firstFlavorPhoto = new Map<number, string>();
    for (const flavor of flavorPhotoRows) {
      if (flavor.imageUrl && !firstFlavorPhoto.has(flavor.productId)) {
        firstFlavorPhoto.set(flavor.productId, flavor.imageUrl);
      }
    }

    return rows.map((row) => ({
      ...row,
      availability: availabilityEnum.parse(row.availability),
      variantCount: variantCount.get(row.id) ?? 0,
      flavorCount: flavorCount.get(row.id) ?? 0,
      /** Foto yang tampil sebagai thumbnail: foto produk, atau foto rasa bila otomatis. */
      thumbnailUrl: row.imageUrl ?? (row.useFlavorPhotos ? (firstFlavorPhoto.get(row.id) ?? null) : null),
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

      const flavors = await ctx.db
        .select()
        .from(productFlavors)
        .where(eq(productFlavors.productId, input.id))
        .orderBy(asc(productFlavors.displayOrder), asc(productFlavors.id));

      return {
        ...row,
        availability: availabilityEnum.parse(row.availability),
        variants,
        flavors,
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
      const flavorPhotos = await ctx.db
        .delete(productFlavors)
        .where(eq(productFlavors.productId, input.id))
        .returning({ imageUrl: productFlavors.imageUrl });
      const deleted = await ctx.db
        .delete(products)
        .where(eq(products.id, input.id))
        .returning()
        .get();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Produk tidak ditemukan." });
      }
      await deleteUnusedPhoto(ctx, deleted.imageUrl, input.id);
      for (const flavor of flavorPhotos) await deleteUnusedPhoto(ctx, flavor.imageUrl, input.id);
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

  /** Geser produk naik/turun di urutan tampil katalog. */
  move: adminProcedure
    .input(z.object({ id: z.number().int().positive(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({ id: products.id })
        .from(products)
        .orderBy(asc(products.displayOrder), asc(products.id));
      const order = moveInOrder(rows.map((row) => row.id), input.id, input.direction);
      if (!order) return { moved: false };
      for (const item of order) {
        await ctx.db.update(products).set({ displayOrder: item.displayOrder }).where(eq(products.id, item.id));
      }
      return { moved: true };
    }),

  /** Varian rasa: tidak mengubah harga, hanya pilihan rasa saat memesan. */
  addFlavor: adminProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        name: z.string().trim().min(1).max(60),
        imageUrl: imageUrlSchema.nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ displayOrder: productFlavors.displayOrder })
        .from(productFlavors)
        .where(eq(productFlavors.productId, input.productId));
      const next = existing.reduce((highest, row) => Math.max(highest, row.displayOrder), 0) + 1;
      return ctx.db
        .insert(productFlavors)
        .values({
          productId: input.productId,
          name: input.name,
          imageUrl: input.imageUrl ?? null,
          displayOrder: next,
        })
        .returning()
        .get();
    }),

  updateFlavor: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().trim().min(1).max(60).optional(),
        isAvailable: z.boolean().optional(),
        /** Foto rasa; null menghapus foto. */
        imageUrl: imageUrlSchema.nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...changes } = input;
      if (Object.keys(changes).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tidak ada perubahan." });
      }
      const before = await ctx.db.select().from(productFlavors).where(eq(productFlavors.id, id)).get();
      if (!before) throw new TRPCError({ code: "NOT_FOUND", message: "Rasa tidak ditemukan." });
      const updated = await ctx.db
        .update(productFlavors)
        .set(changes)
        .where(eq(productFlavors.id, id))
        .returning()
        .get();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Rasa tidak ditemukan." });
      if (changes.imageUrl !== undefined && before.imageUrl && before.imageUrl !== updated.imageUrl) {
        await deleteUnusedPhoto(ctx, before.imageUrl, null, id);
      }
      return updated;
    }),

  moveFlavor: adminProcedure
    .input(z.object({ id: z.number().int().positive(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const flavor = await ctx.db.select().from(productFlavors).where(eq(productFlavors.id, input.id)).get();
      if (!flavor) throw new TRPCError({ code: "NOT_FOUND", message: "Rasa tidak ditemukan." });
      const siblings = await ctx.db
        .select({ id: productFlavors.id })
        .from(productFlavors)
        .where(eq(productFlavors.productId, flavor.productId))
        .orderBy(asc(productFlavors.displayOrder), asc(productFlavors.id));
      const order = moveInOrder(siblings.map((row) => row.id), input.id, input.direction);
      if (!order) return { moved: false };
      for (const item of order) {
        await ctx.db
          .update(productFlavors)
          .set({ displayOrder: item.displayOrder })
          .where(eq(productFlavors.id, item.id));
      }
      return { moved: true };
    }),

  removeFlavor: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const removed = await ctx.db
        .delete(productFlavors)
        .where(eq(productFlavors.id, input.id))
        .returning()
        .get();
      if (removed?.imageUrl) await deleteUnusedPhoto(ctx, removed.imageUrl, null, input.id);
      return { ok: true as const };
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

import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";
import {
  productCategories,
  productFlavors,
  productVariants,
  products,
} from "@delisert.mks-1/db/schema/index";
import { publicProcedure, router } from "../index";

const availabilityEnum = z.enum(["available", "preorder", "soldout"]);

export const productRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          featuredOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          description: products.description,
          priceCents: products.priceCents,
          imageUrl: products.imageUrl,
          imageAlt: products.imageAlt,
          availability: products.availability,
          isFeatured: products.isFeatured,
          useFlavorPhotos: products.useFlavorPhotos,
          displayOrder: products.displayOrder,
          categorySlug: productCategories.slug,
          categoryName: productCategories.name,
        })
        .from(products)
        .innerJoin(productCategories, eq(products.categoryId, productCategories.id))
        // Kategori nonaktif menyembunyikan semua produknya dari situs publik.
        .where(eq(productCategories.isActive, true))
        .orderBy(asc(products.displayOrder), asc(products.id));

      const filtered = rows.filter((row) => {
        if (input?.category && row.categorySlug !== input.category) return false;
        if (input?.featuredOnly && !row.isFeatured) return false;
        return true;
      });

      if (filtered.length === 0) return [];

      const variantRows = await ctx.db
        .select()
        .from(productVariants)
        .orderBy(asc(productVariants.displayOrder), asc(productVariants.id));

      const flavorRows = await ctx.db
        .select()
        .from(productFlavors)
        .orderBy(asc(productFlavors.displayOrder), asc(productFlavors.id));
      const flavorsByProduct = new Map<number, typeof flavorRows>();
      for (const flavor of flavorRows) {
        const list = flavorsByProduct.get(flavor.productId) ?? [];
        list.push(flavor);
        flavorsByProduct.set(flavor.productId, list);
      }

      const variantsByProduct = new Map<number, typeof variantRows>();
      for (const variant of variantRows) {
        const list = variantsByProduct.get(variant.productId) ?? [];
        list.push(variant);
        variantsByProduct.set(variant.productId, list);
      }

      return filtered.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        priceCents: row.priceCents,
        imageUrl: row.imageUrl,
        imageAlt: row.imageAlt,
        availability: availabilityEnum.parse(row.availability),
        isFeatured: row.isFeatured,
        useFlavorPhotos: row.useFlavorPhotos,
        category: { slug: row.categorySlug, name: row.categoryName },
        variants: (variantsByProduct.get(row.id) ?? []).map((variant) => ({
          id: variant.id,
          name: variant.name,
          priceCents: variant.priceCents,
          isAvailable: variant.isAvailable,
        })),
        flavors: (flavorsByProduct.get(row.id) ?? []).map((flavor) => ({
          id: flavor.id,
          name: flavor.name,
          imageUrl: flavor.imageUrl,
          isAvailable: flavor.isAvailable,
        })),
      }));
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          description: products.description,
          priceCents: products.priceCents,
          imageUrl: products.imageUrl,
          imageAlt: products.imageAlt,
          availability: products.availability,
          useFlavorPhotos: products.useFlavorPhotos,
          categoryId: products.categoryId,
          categorySlug: productCategories.slug,
          categoryName: productCategories.name,
        })
        .from(products)
        .innerJoin(productCategories, eq(products.categoryId, productCategories.id))
        .where(and(eq(products.slug, input.slug), eq(productCategories.isActive, true)))
        .get();

      if (!row) return null;

      const variantRows = await ctx.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, row.id))
        .orderBy(asc(productVariants.displayOrder), asc(productVariants.id));

      const flavorRows = await ctx.db
        .select()
        .from(productFlavors)
        .where(eq(productFlavors.productId, row.id))
        .orderBy(asc(productFlavors.displayOrder), asc(productFlavors.id));

      const relatedRows = await ctx.db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          imageUrl: products.imageUrl,
          useFlavorPhotos: products.useFlavorPhotos,
        })
        .from(products)
        .innerJoin(productCategories, eq(products.categoryId, productCategories.id))
        .where(eq(productCategories.isActive, true))
        .orderBy(asc(products.displayOrder), asc(products.id))
        .limit(5);

      const relatedFlavorPhoto = new Map<number, string>();
      const relatedIds = relatedRows.filter((related) => !related.imageUrl && related.useFlavorPhotos).map((related) => related.id);
      if (relatedIds.length > 0) {
        const photos = await ctx.db
          .select({ productId: productFlavors.productId, imageUrl: productFlavors.imageUrl })
          .from(productFlavors)
          .where(and(inArray(productFlavors.productId, relatedIds), isNotNull(productFlavors.imageUrl)))
          .orderBy(asc(productFlavors.displayOrder), asc(productFlavors.id));
        for (const photo of photos) {
          if (photo.imageUrl && !relatedFlavorPhoto.has(photo.productId)) {
            relatedFlavorPhoto.set(photo.productId, photo.imageUrl);
          }
        }
      }

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        priceCents: row.priceCents,
        imageUrl: row.imageUrl,
        imageAlt: row.imageAlt,
        availability: availabilityEnum.parse(row.availability),
        useFlavorPhotos: row.useFlavorPhotos,
        category: { slug: row.categorySlug, name: row.categoryName },
        variants: variantRows.map((variant) => ({
          id: variant.id,
          name: variant.name,
          priceCents: variant.priceCents,
          isAvailable: variant.isAvailable,
        })),
        flavors: flavorRows.map((flavor) => ({
          id: flavor.id,
          name: flavor.name,
          imageUrl: flavor.imageUrl,
          isAvailable: flavor.isAvailable,
        })),
        related: relatedRows
          .filter((related) => related.slug !== row.slug)
          .slice(0, 4)
          .map((related) => ({
            slug: related.slug,
            name: related.name,
            // Tanpa foto produk: pakai foto rasa pertama bila foto otomatis dari rasa aktif.
            imageUrl:
              related.imageUrl ??
              (related.useFlavorPhotos ? (relatedFlavorPhoto.get(related.id) ?? null) : null),
          })),
      };
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: productCategories.id,
        slug: productCategories.slug,
        name: productCategories.name,
        description: productCategories.description,
        displayOrder: productCategories.displayOrder,
      })
      .from(productCategories)
      .where(eq(productCategories.isActive, true))
      .orderBy(asc(productCategories.displayOrder), asc(productCategories.id));

    const counts = await ctx.db
      .select({ categoryId: products.categoryId })
      .from(products);

    const countByCategory = new Map<number, number>();
    for (const row of counts) {
      countByCategory.set(row.categoryId, (countByCategory.get(row.categoryId) ?? 0) + 1);
    }

    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      productCount: countByCategory.get(row.id) ?? 0,
    }));
  }),
});

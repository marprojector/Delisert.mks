import { eq } from "drizzle-orm";
import { productCategories, productVariants, products } from "./schema";

/**
 * Data seed resmi dari pemilik bisnis. Sumber: docs/DESIGN_AUDIT.md §2.
 * Harga dalam sen (price_cents). Jangan mengubah tanpa konfirmasi pemilik.
 */
const CATEGORIES = [
  { slug: "mochi", name: "Mochi", description: "Mochi lembut dengan berbagai varian rasa", displayOrder: 1 },
  { slug: "mango-sticky-rice", name: "Mango Sticky Rice", description: "Ketan manis dengan mangga segar", displayOrder: 2 },
  { slug: "pancake-durian", name: "Pancake Durian", description: "Pancake lembut dengan isian durian", displayOrder: 3 },
  { slug: "dubai-chewy-cookie", name: "Dubai Chewy Cookie", description: "Cookie chewy premium", displayOrder: 4 },
  { slug: "slice-cake", name: "Slice Cake", description: "Kue lapis artisanal per slice", displayOrder: 5 },
  { slug: "mille-crepes", name: "Mille Crepes", description: "Kue crepes berlapis-lapis per slice", displayOrder: 6 },
] as const;

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  priceCents: number | null;
  isFeatured: boolean;
  displayOrder: number;
  variants?: Array<{ name: string; priceCents: number | null; displayOrder: number }>;
};

const PRODUCTS: Record<string, ProductSeed[]> = {
  mochi: [
    {
      slug: "artisanal-mochi-daifuku",
      name: "Artisanal Mochi Daifuku",
      description:
        "Mochi lembut buatan tangan dengan isian krim pilihan. Tersedia dalam 8 varian rasa dan tiga ukuran porsi — 1 pcs, isi 4, dan isi 8. Varian rasa boleh dicampur sesuai selera.",
      priceCents: 8000,
      isFeatured: true,
      displayOrder: 1,
      variants: [
        { name: "1 Pcs", priceCents: 8000, displayOrder: 1 },
        { name: "Isi 4 pcs", priceCents: 30000, displayOrder: 2 },
        { name: "Isi 8 pcs", priceCents: 50000, displayOrder: 3 },
      ],
    },
  ],
  "mango-sticky-rice": [
    {
      slug: "authentic-mango-sticky-rice",
      name: "Authentic Mango Sticky Rice",
      description:
        "Ketan manis yang dikukus dengan santan, disajikan bersama potongan mangga segar. Harga datar per porsi.",
      priceCents: 30000,
      isFeatured: true,
      displayOrder: 2,
    },
  ],
  "pancake-durian": [
    {
      slug: "pancake-durian-premium",
      name: "Pancake Durian Premium",
      description:
        "Pancake lembut dengan isian durian pilihan. Dijual harga datar tunggal Rp 35.000 per porsi mika, tanpa paket isi 4 atau isi 8. Wajib disimpan di chiller.",
      priceCents: 35000,
      isFeatured: true,
      displayOrder: 3,
    },
  ],
  "dubai-chewy-cookie": [
    {
      slug: "dubai-chewy-cookie",
      name: "Dubai Chewy Cookie",
      description: "Cookie chewy premium dengan tekstur kenyal dan cokelat yang melimpah.",
      priceCents: 30000,
      isFeatured: true,
      displayOrder: 4,
    },
  ],
  "slice-cake": [
    {
      slug: "slice-cake",
      name: "Slice Cake",
      description:
        "Kue lapis artisanal dengan tekstur lembut dan krim yang seimbang. Dijual per slice dengan tiga pilihan varian rasa — Lotus Biscoff, Red Velvet, dan Coklat. Ketiga varian seharga.",
      priceCents: 16000,
      isFeatured: true,
      displayOrder: 5,
      variants: [
        { name: "Lotus Biscoff", priceCents: 16000, displayOrder: 1 },
        { name: "Red Velvet", priceCents: 16000, displayOrder: 2 },
        { name: "Coklat", priceCents: 16000, displayOrder: 3 },
      ],
    },
  ],
  "mille-crepes": [
    {
      slug: "mille-crepes",
      name: "Mille Crepes",
      description:
        "Kue crepes berlapis-lapis dengan krim lembut. Dijual per slice dengan tiga pilihan varian rasa — Lotus Biscoff, Red Velvet, dan Coklat. Ketiga varian seharga.",
      priceCents: 16000,
      isFeatured: true,
      displayOrder: 6,
      variants: [
        { name: "Lotus Biscoff", priceCents: 16000, displayOrder: 1 },
        { name: "Red Velvet", priceCents: 16000, displayOrder: 2 },
        { name: "Coklat", priceCents: 16000, displayOrder: 3 },
      ],
    },
  ],
};

/**
 * Subset drizzle SQLite database yang dipakai oleh seed.
 * Dibuat longgar agar seed bisa berjalan di driver apa pun
 * (D1 di production, bun-sqlite di lokal).
 */
type SeedDb = {
  select: (...args: any[]) => any;
  insert: (table: any) => any;
  update: (table: any) => any;
  delete: (table: any) => any;
};

export async function seed(db: SeedDb) {
  const categoryIds = new Map<string, number>();

  for (const category of CATEGORIES) {
    const existing = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.slug, category.slug))
      .get();

    if (existing) {
      await db
        .update(productCategories)
        .set({
          name: category.name,
          description: category.description,
          displayOrder: category.displayOrder,
        })
        .where(eq(productCategories.id, existing.id));
      categoryIds.set(category.slug, existing.id);
      continue;
    }

    const inserted = await db.insert(productCategories).values(category).returning().get();
    categoryIds.set(category.slug, inserted.id);
  }

  for (const [categorySlug, items] of Object.entries(PRODUCTS)) {
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`Kategori tidak ditemukan: ${categorySlug}`);

    for (const item of items) {
      const existing = await db.select().from(products).where(eq(products.slug, item.slug)).get();

      const values = {
        categoryId,
        slug: item.slug,
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
        isFeatured: item.isFeatured,
        displayOrder: item.displayOrder,
      };

      // Rekonsiliasi, bukan lewati: kalau harga pernah menyimpang dari daftar
      // resmi, menjalankan ulang seed harus memperbaikinya.
      let productId: number;
      if (existing) {
        await db.update(products).set(values).where(eq(products.id, existing.id));
        productId = existing.id;
      } else {
        productId = (await db.insert(products).values(values).returning().get()).id;
      }

      if (item.variants) {
        await db.delete(productVariants).where(eq(productVariants.productId, productId));
        await db.insert(productVariants).values(
          item.variants.map((variant) => ({
            productId,
            name: variant.name,
            priceCents: variant.priceCents,
            displayOrder: variant.displayOrder,
          })),
        );
      }
    }
  }
}

/**
 * Kalimat log aktivitas untuk setiap perubahan dari admin atau MCP.
 * Nama produk/rasa/kategori dicari sebelum perubahan dijalankan (lihat
 * resolveActivityNames), supaya log tetap bermakna setelah sesuatu dihapus.
 */
import type { Database } from "@delisert.mks-1/db";
import {
  mcpTokens,
  productCategories,
  productFlavors,
  productVariants,
  products,
} from "@delisert.mks-1/db/schema/index";
import { eq } from "drizzle-orm";

const AVAILABILITY: Record<string, string> = {
  available: "Tersedia",
  preorder: "Pre-Order",
  soldout: "Habis",
};

const SECTION: Record<string, string> = {
  brand: "Brand & kontak",
  home: "Beranda",
  schedule: "Jadwal & lokasi",
  about: "Tentang",
  contact: "Kontak",
};

const PRODUCT_FIELD: Record<string, string> = {
  name: "nama",
  slug: "slug",
  description: "deskripsi",
  priceCents: "harga",
  imageUrl: "foto",
  imageAlt: "alt text foto",
  isFeatured: "unggulan",
  useFlavorPhotos: "foto otomatis dari rasa",
  availability: "ketersediaan",
  categoryId: "kategori",
  displayOrder: "urutan",
};

type Input = Record<string, unknown>;

/** Nama-nama yang dirujuk perubahan, dicari sebelum perubahan berjalan. */
export type ActivityNames = {
  product?: string;
  flavor?: string;
  variant?: string;
  category?: string;
  token?: string;
};

const quoted = (value: unknown) => (typeof value === "string" && value ? `“${value}”` : "");
const id = (input: Input, key = "id") => `#${String(input[key] ?? "?")}`;

export function describeActivity(
  path: string,
  raw: unknown,
  names: ActivityNames = {},
): { action: string; summary: string } | null {
  const input = (raw && typeof raw === "object" ? raw : {}) as Input;
  const product = quoted(names.product) || `produk ${id(input)}`;
  const parentProduct = quoted(names.product) || `produk ${id(input, "productId")}`;
  const inProduct = names.product ? ` (${names.product})` : "";
  const flavor = (quoted(names.flavor) || id(input)) + inProduct;
  const variant = (quoted(names.variant) || id(input)) + inProduct;
  const category = quoted(names.category) || quoted(input.name) || `kategori ${id(input)}`;
  const changed = (fields: Record<string, string>) =>
    Object.keys(input)
      .filter((key) => key !== "id" && fields[key])
      .map((key) => fields[key]!)
      .join(", ");

  const describe: Record<string, () => string> = {
    "adminProduct.create": () => `Menambah produk ${quoted(input.name)}`,
    "adminProduct.update": () => {
      const fields = changed(PRODUCT_FIELD);
      return `Mengubah produk ${product}${fields ? `: ${fields}` : ""}`;
    },
    "adminProduct.remove": () => `Menghapus produk ${product}`,
    "adminProduct.setAvailability": () =>
      `Menandai ${product} ${AVAILABILITY[String(input.availability)] ?? input.availability}`,
    "adminProduct.move": () => `Mengubah urutan ${product}`,
    "adminProduct.addVariant": () => `Menambah ukuran ${quoted(input.name)} ke ${parentProduct}`,
    "adminProduct.updateVariant": () =>
      typeof input.isAvailable === "boolean" && Object.keys(input).length === 2
        ? `Menandai ukuran ${variant} ${input.isAvailable ? "tersedia" : "habis"}`
        : `Mengubah ukuran ${variant}`,
    "adminProduct.removeVariant": () => `Menghapus ukuran ${variant}`,
    "adminProduct.addFlavor": () => `Menambah rasa ${quoted(input.name)} ke ${parentProduct}`,
    "adminProduct.updateFlavor": () => {
      if (typeof input.isAvailable === "boolean" && Object.keys(input).length === 2) {
        return `Menandai rasa ${flavor} ${input.isAvailable ? "tersedia" : "habis"}`;
      }
      if ("imageUrl" in input && Object.keys(input).length === 2) {
        return input.imageUrl ? `Memasang foto rasa ${flavor}` : `Menghapus foto rasa ${flavor}`;
      }
      if (typeof input.name === "string" && Object.keys(input).length === 2) {
        return `Mengganti nama rasa ${flavor} menjadi ${quoted(input.name)}`;
      }
      return `Mengubah rasa ${flavor}`;
    },
    "adminProduct.moveFlavor": () => `Mengubah urutan rasa ${flavor}`,
    "adminProduct.removeFlavor": () => `Menghapus rasa ${flavor}`,
    "adminCategory.create": () => `Menambah kategori ${quoted(input.name)}`,
    "adminCategory.update": () =>
      typeof input.isActive === "boolean" && Object.keys(input).length === 2
        ? `${input.isActive ? "Menampilkan" : "Menyembunyikan"} kategori ${category}`
        : `Mengubah kategori ${category}`,
    "adminCategory.move": () => `Mengubah urutan kategori ${category}`,
    "adminCategory.remove": () => `Menghapus kategori ${category}`,
    "adminSite.update": () => `Mengubah konten ${SECTION[String(input.section)] ?? input.section}`,
    "adminSite.reset": () => `Mengembalikan konten ${SECTION[String(input.section)] ?? input.section} ke bawaan`,
    "adminMcp.create": () => `Membuat token MCP ${quoted(input.name)}`,
    "adminMcp.revoke": () => `Mencabut token MCP ${quoted(names.token) || id(input)}`,
  };
  const text = describe[path];
  return text ? { action: path, summary: text().replace(/\s+/g, " ").trim() } : null;
}

const numberOf = (value: unknown) => (typeof value === "number" && Number.isInteger(value) ? value : null);

/** Cari nama yang dirujuk sebuah perubahan. Gagal mencari tidak pernah melempar. */
export async function resolveActivityNames(db: Database, path: string, raw: unknown): Promise<ActivityNames> {
  const input = (raw && typeof raw === "object" ? raw : {}) as Input;
  const rowId = numberOf(input.id);
  const productId = numberOf(input.productId);
  try {
    if (/^adminProduct\.(update|remove|setAvailability|move)$/.test(path) && rowId) {
      const row = await db.select({ name: products.name }).from(products).where(eq(products.id, rowId)).get();
      return { product: row?.name };
    }
    if (/^adminProduct\.add(Variant|Flavor)$/.test(path) && productId) {
      const row = await db.select({ name: products.name }).from(products).where(eq(products.id, productId)).get();
      return { product: row?.name };
    }
    if (/^adminProduct\.(update|move|remove)Flavor$/.test(path) && rowId) {
      const row = await db
        .select({ flavor: productFlavors.name, product: products.name })
        .from(productFlavors)
        .innerJoin(products, eq(products.id, productFlavors.productId))
        .where(eq(productFlavors.id, rowId))
        .get();
      return { flavor: row?.flavor, product: row?.product };
    }
    if (/^adminProduct\.(update|remove)Variant$/.test(path) && rowId) {
      const row = await db
        .select({ variant: productVariants.name, product: products.name })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(eq(productVariants.id, rowId))
        .get();
      return { variant: row?.variant, product: row?.product };
    }
    if (/^adminCategory\.(update|move|remove)$/.test(path) && rowId) {
      const row = await db
        .select({ name: productCategories.name })
        .from(productCategories)
        .where(eq(productCategories.id, rowId))
        .get();
      return { category: row?.name };
    }
    if (path === "adminMcp.revoke" && rowId) {
      const row = await db.select({ name: mcpTokens.name }).from(mcpTokens).where(eq(mcpTokens.id, rowId)).get();
      return { token: row?.name };
    }
  } catch {
    // Log tetap ditulis tanpa nama.
  }
  return {};
}

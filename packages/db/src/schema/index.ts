import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productCategories = sqliteTable("product_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => productCategories.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents"),
  currency: text("currency").notNull().default("IDR"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  availability: text("availability").notNull().default("available"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const productVariants = sqliteTable("product_variants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priceCents: integer("price_cents"),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

/**
 * Varian rasa produk (mis. Matcha Oreo, Lotus Biscoff). Terpisah dari
 * product_variants yang menyatakan ukuran/harga: mochi punya 3 ukuran × 9 rasa.
 * Rasa tidak mengubah harga.
 */
export const productFlavors = sqliteTable("product_flavors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

/**
 * Konten website yang bisa diubah pemilik dari admin (teks beranda, jadwal,
 * tentang, kontak, sosial media). Satu baris per bagian; `value` berisi JSON
 * yang divalidasi di packages/api/src/lib/site-content.ts. Bagian yang belum
 * pernah diubah memakai nilai bawaan dari kode.
 */
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Token akses MCP yang dibuat pemilik di admin. Token mentah hanya ditampilkan
 * sekali saat dibuat; yang disimpan hanya hash SHA-256-nya.
 */
export const mcpTokens = sqliteTable("mcp_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  /** Beberapa karakter awal token, untuk dikenali di daftar ("dlsrt_ab12…"). */
  tokenPrefix: text("token_prefix").notNull(),
  /** "read" = hanya membaca; "write" = boleh mengubah katalog dan konten. */
  scope: text("scope").notNull().default("read"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  lastUsedAt: text("last_used_at"),
  revokedAt: text("revoked_at"),
});

/** Jejak perubahan dari admin maupun MCP, ditampilkan di Ringkasan. */
export const activityLog = sqliteTable("activity_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** "admin" atau "mcp:<nama token>". */
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  summary: text("summary").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { relations } from "./relations";
import { seed } from "./seed";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const LOCAL_D1_DIR = join(
  REPO_ROOT,
  "packages/infra/.alchemy/local/d1/cloudflare-runtime-D1DatabaseObject",
);

function findDatabaseFile(dir: string): string {
  const entries = readdirSync(dir);
  const candidates = entries
    .filter((name) => name.endsWith(".sqlite") && !name.startsWith("metadata"))
    .map((name) => ({ name, mtime: statSync(join(dir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (candidates.length === 0) {
    throw new Error(
      `Tidak ada file database di ${dir}. Jalankan \`bun run dev\` dari packages/infra lebih dulu agar D1 lokal dibuat.`,
    );
  }

  return join(dir, candidates[0]!.name);
}

const dbFile = findDatabaseFile(LOCAL_D1_DIR);
console.log(`Target database: ${dbFile}`);

const client = new Database(dbFile);
// Catatan: di drizzle-orm 1.0.0-rc.5, drizzle(client, config) posisional TIDAK
// diteruskan sebagai client — parameter pertama dibaca sebagai objek config dan
// driver membuka :memory:. Harus lewat { client }.
const db = drizzle({ client, relations });

await seed(db);

const counts = {
  categories: client.query("select count(*) as n from product_categories").get() as { n: number },
  products: client.query("select count(*) as n from products").get() as { n: number },
  variants: client.query("select count(*) as n from product_variants").get() as { n: number },
};

console.log(
  `Seed selesai — ${counts.categories.n} kategori, ${counts.products.n} produk, ${counts.variants.n} varian.`,
);

client.close();

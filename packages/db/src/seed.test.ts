import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { relations } from "./relations";
import { seed } from "./seed";

const MIGRATION = join(
  import.meta.dir,
  "migrations/20261031071817_overjoyed_slipstream/migration.sql",
);

function makeDb() {
  const client = new Database(":memory:");
  for (const statement of readFileSync(MIGRATION, "utf8").split("--> statement-breakpoint")) {
    if (statement.trim()) client.exec(statement);
  }
  return { client, db: drizzle({ client, relations }) };
}

describe("seed", () => {
  test("inserts the authoritative price list", async () => {
    const { client, db } = makeDb();
    await seed(db);

    const mochi = client
      .query("select price_cents from products where slug = ?")
      .get("artisanal-mochi-daifuku") as { price_cents: number };
    expect(mochi.price_cents).toBe(8000);

    const crepes = client
      .query("select price_cents from products where slug = ?")
      .get("mille-crepes") as { price_cents: number };
    expect(crepes.price_cents).toBe(16000);

    const pancake = client
      .query("select price_cents from products where slug = ?")
      .get("pancake-durian-premium") as { price_cents: number };
    expect(pancake.price_cents).toBe(35000);
  });

  test("is idempotent — running twice does not duplicate", async () => {
    const { client, db } = makeDb();
    await seed(db);
    await seed(db);
    const count = client.query("select count(*) as n from products").get() as { n: number };
    expect(count.n).toBe(6);
  });

  test("re-running repairs a drifted price", async () => {
    const { client, db } = makeDb();
    await seed(db);
    client.exec("update products set price_cents = 80000 where slug = 'artisanal-mochi-daifuku'");
    await seed(db);
    const mochi = client
      .query("select price_cents from products where slug = ?")
      .get("artisanal-mochi-daifuku") as { price_cents: number };
    expect(mochi.price_cents).toBe(8000);
  });

  test("seeds exactly three mochi size variants", async () => {
    const { client, db } = makeDb();
    await seed(db);
    const rows = client
      .query(
        `select v.name, v.price_cents from product_variants v
         join products p on p.id = v.product_id
         where p.slug = 'artisanal-mochi-daifuku' order by v.display_order`,
      )
      .all() as Array<{ name: string; price_cents: number }>;
    expect(rows.map((row) => [row.name, row.price_cents])).toEqual([
      ["1 Pcs", 8000],
      ["Isi 4 pcs", 30000],
      ["Isi 8 pcs", 50000],
    ]);
  });
});

describe("seed.production.sql", () => {
  const PRODUCTION_SEED = readFileSync(join(import.meta.dir, "seed.production.sql"), "utf8");
  const counts = (client: Database) => ({
    products: (client.query("select count(*) as n from products").get() as { n: number }).n,
    variants: (client.query("select count(*) as n from product_variants").get() as { n: number }).n,
  });

  test("repeated imports do not duplicate variants", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 6, variants: 9 });
    client.exec(PRODUCTION_SEED);
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 6, variants: 9 });
  });

  test("a product the owner deleted stays deleted after a redeploy", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    client.exec("delete from product_variants where product_id = (select id from products where slug = 'mille-crepes')");
    client.exec("delete from products where slug = 'mille-crepes'");
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 5, variants: 6 });
  });
});

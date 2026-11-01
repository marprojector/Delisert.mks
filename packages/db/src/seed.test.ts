import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { relations } from "./relations";
import { seed } from "./seed";

const MIGRATIONS = join(import.meta.dir, "migrations");

function makeDb() {
  const client = new Database(":memory:");
  for (const folder of readdirSync(MIGRATIONS).filter((name) => /^\d/.test(name)).sort()) {
    const sql = readFileSync(join(MIGRATIONS, folder, "migration.sql"), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      if (statement.trim()) client.exec(statement);
    }
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
    flavors: (client.query("select count(*) as n from product_flavors").get() as { n: number }).n,
  });
  const flavorsOf = (client: Database, slug: string) =>
    (
      client
        .query(
          "select f.name from product_flavors f join products p on p.id = f.product_id where p.slug = ? order by f.display_order",
        )
        .all(slug) as Array<{ name: string }>
    ).map((row) => row.name);

  test("avoids UNION chains, which Cloudflare D1 rejects as too many compound SELECT terms", () => {
    expect(PRODUCTION_SEED).not.toMatch(/\bUNION\b/i);
  });

  test("repeated imports do not duplicate variants", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 6, variants: 3, flavors: 15 });
    client.exec(PRODUCTION_SEED);
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 6, variants: 3, flavors: 15 });
  });

  test("a catalogue the owner emptied on purpose stays empty after a redeploy", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    client.exec("delete from product_variants");
    client.exec("delete from product_flavors");
    client.exec("delete from products");
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 0, variants: 0, flavors: 0 });
  });

  test("a database seeded before the seed marker existed gains no duplicates", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    client.exec("drop table _seed_state");
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 6, variants: 3, flavors: 15 });
  });

  test("a product the owner deleted stays deleted after a redeploy", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    client.exec("delete from product_variants where product_id = (select id from products where slug = 'mille-crepes')");
    client.exec("delete from product_flavors where product_id = (select id from products where slug = 'mille-crepes')");
    client.exec("delete from products where slug = 'mille-crepes'");
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 5, variants: 3, flavors: 12 });
  });

  test("mochi gets 9 flavours; cake flavours move out of the size options", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    expect(flavorsOf(client, "artisanal-mochi-daifuku")).toEqual([
      "Strawberry Choco",
      "Choco Crunchy",
      "Matcha Oreo",
      "Vanilla",
      "Red Velvet",
      "Mango Cheesecream",
      "Grape Choco",
      "Oreo Cheesecream",
      "Lotus Biscoff",
    ]);
    expect(flavorsOf(client, "mille-crepes")).toEqual(["Lotus Biscoff", "Red Velvet", "Coklat"]);
    const cakeVariants = client
      .query("select count(*) as n from product_variants v join products p on p.id = v.product_id where p.slug in ('slice-cake','mille-crepes')")
      .get() as { n: number };
    expect(cakeVariants.n).toBe(0);
  });

  test("the live database (seeded before flavours existed) is converted once", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    // Keadaan produksi sebelum fitur rasa: rasa kue tersimpan sebagai varian.
    client.exec("delete from product_flavors");
    client.exec("delete from _seed_state where key = 'flavors'");
    client.exec(`insert into product_variants (product_id, name, price_cents, display_order)
      select id, 'Lotus Biscoff', 16000, 1 from products where slug in ('slice-cake', 'mille-crepes')`);
    client.exec("update products set description = 'Tersedia dalam 8 varian rasa.' where slug = 'artisanal-mochi-daifuku'");
    client.exec(PRODUCTION_SEED);
    expect(counts(client)).toEqual({ products: 6, variants: 3, flavors: 15 });
    const description = client
      .query("select description from products where slug = 'artisanal-mochi-daifuku'")
      .get() as { description: string };
    expect(description.description).toContain("9 varian rasa");
  });

  test("a flavour the owner deleted stays deleted after a redeploy", () => {
    const { client } = makeDb();
    client.exec(PRODUCTION_SEED);
    client.exec("delete from product_flavors where name = 'Vanilla'");
    client.exec(PRODUCTION_SEED);
    expect(flavorsOf(client, "artisanal-mochi-daifuku")).not.toContain("Vanilla");
  });
});

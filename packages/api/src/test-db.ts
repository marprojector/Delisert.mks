/** Basis data in-memory untuk tes: semua migrasi + data contoh. Hanya dipakai tes. */
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { relations } from "@delisert.mks-1/db/relations";
import { seed } from "@delisert.mks-1/db/seed";

import type { Context } from "./context";
import { appRouter } from "./routers/index";

const MIGRATIONS = join(import.meta.dir, "../../db/src/migrations");

export async function createTestDb() {
  const client = new Database(":memory:");
  for (const folder of readdirSync(MIGRATIONS).filter((name) => /^\d/.test(name)).sort()) {
    const sql = readFileSync(join(MIGRATIONS, folder, "migration.sql"), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      if (statement.trim()) client.exec(statement);
    }
  }
  const db = drizzle({ client, relations });
  await seed(db);
  return { client, db: db as never as Context["db"] };
}

export const testCtx = (db: Context["db"], extra: Partial<Context> = {}): Context => ({
  db,
  adminSecret: "s",
  adminPassword: "p",
  ...extra,
});

export async function adminCaller(db: Context["db"], extra: Partial<Context> = {}) {
  const { token } = await appRouter.createCaller(testCtx(db)).adminAuth.login({ password: "p" });
  return appRouter.createCaller(testCtx(db, { ...extra, authorization: `Bearer ${token}` }));
}

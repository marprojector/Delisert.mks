import { type Database, createDb } from "@delisert.mks-1/db";

import { ENV } from "./env.server";

export function getDb(): Database {
  return createDb(ENV);
}

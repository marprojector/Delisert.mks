import type { Context as ApiContext } from "@delisert.mks-1/api/context";
import { env } from "cloudflare:workers";

import { getDb } from "./services";

/**
 * Konteks tRPC dibuat per request. Rahasia admin dibaca dari binding Worker,
 * jadi tidak pernah masuk ke bundle klien.
 */
export async function createContext({ req }: { req: Request }): Promise<ApiContext> {
  return {
    db: getDb(),
    adminSecret: env.ADMIN_SESSION_SECRET,
    adminPassword: env.ADMIN_PASSWORD,
    authorization: req.headers.get("authorization") ?? undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

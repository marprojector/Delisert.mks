import type { Context as ApiContext } from "@delisert.mks-1/api/context";
import { CLOUDFLARE_ACCOUNT_TAG, WEB_ANALYTICS_SITE_TAG } from "@delisert.mks-1/api/lib/web-analytics";
import { env } from "cloudflare:workers";

import { getDb } from "./services";

/**
 * Konteks tRPC dibuat per request. Rahasia admin dibaca dari binding Worker,
 * jadi tidak pernah masuk ke bundle klien.
 */
export async function createContext({ req }: { req: Request }): Promise<ApiContext> {
  return baseContext({
    authorization: req.headers.get("authorization") ?? undefined,
    clientIp: req.headers.get("cf-connecting-ip") ?? undefined,
  });
}

/** Konteks API dengan binding Worker; dipakai tRPC dan server MCP. */
export function baseContext(extra: Partial<ApiContext> = {}): ApiContext {
  const analyticsToken = (env as { CF_ANALYTICS_API_TOKEN?: string }).CF_ANALYTICS_API_TOKEN;
  return {
    db: getDb(),
    adminSecret: env.ADMIN_SESSION_SECRET,
    adminPassword: env.ADMIN_PASSWORD,
    deletePhoto: async (key) => {
      await env.PHOTOS.delete(key);
    },
    analytics: analyticsToken
      ? { apiToken: analyticsToken, accountTag: CLOUDFLARE_ACCOUNT_TAG, siteTag: WEB_ANALYTICS_SITE_TAG }
      : null,
    ...extra,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

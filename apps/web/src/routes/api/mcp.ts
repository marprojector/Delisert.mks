import { createSessionToken } from "@delisert.mks-1/api/lib/admin-session";
import { bearerMcpToken } from "@delisert.mks-1/api/lib/mcp-token";
import { handleMcpRequest } from "@delisert.mks-1/api/mcp/server";
import { authenticateMcpToken } from "@delisert.mks-1/api/routers/admin-insights";
import { appRouter } from "@delisert.mks-1/api/routers/index";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

import { baseContext } from "../../context";
import { getDb } from "../../services";

/** Sesi admin internal sekali pakai untuk satu panggilan alat MCP. */
const MCP_SESSION_TTL_MS = 60_000;

/**
 * Endpoint MCP (Streamable HTTP, stateless). Token dibuat pemilik di
 * admin → MCP dan dikirim sebagai "Authorization: Bearer dlsrt_...",
 * atau ?key=dlsrt_... untuk klien yang tidak bisa menambah header.
 */
async function handle({ request }: { request: Request }) {
  const db = getDb();
  return handleMcpRequest(request, {
    readToken: (incoming) =>
      bearerMcpToken(incoming.headers.get("authorization")) ??
      bearerMcpToken(`Bearer ${new URL(incoming.url).searchParams.get("key") ?? ""}`),
    authenticate: (token) => authenticateMcpToken(db, token),
    createCaller: async (principal) => {
      const session = await createSessionToken(env.ADMIN_SESSION_SECRET, Date.now(), MCP_SESSION_TTL_MS);
      return appRouter.createCaller(
        baseContext({ authorization: `Bearer ${session}`, actor: `mcp:${principal.name}` }),
      );
    },
  });
}

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      DELETE: handle,
    },
  },
});

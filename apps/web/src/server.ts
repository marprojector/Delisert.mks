import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { canonicalRedirect } from "./utils/canonical-host";

/**
 * Entri server: sama dengan bawaan TanStack Start, ditambah pengalihan
 * permanen dari alamat lama workers.dev ke delisert.me.
 */
export default createServerEntry({
  async fetch(request, opts) {
    const target = canonicalRedirect(request);
    if (target) return Response.redirect(target, 301);

    const response = await handler.fetch(request, opts);

    // Add cache-control headers for HTML pages
    if (response.headers.get("content-type")?.includes("text/html")) {
      const headers = new Headers(response.headers);
      headers.set("cache-control", "public, max-age=300, s-maxage=3600");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
});

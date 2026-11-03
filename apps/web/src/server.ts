import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { canonicalRedirect } from "./utils/canonical-host";

/**
 * Entri server: sama dengan bawaan TanStack Start, ditambah pengalihan
 * permanen dari alamat lama workers.dev ke delisert.me.
 */
export default createServerEntry({
  fetch(request, opts) {
    const target = canonicalRedirect(request);
    if (target) return Response.redirect(target, 301);
    return handler.fetch(request, opts);
  },
});

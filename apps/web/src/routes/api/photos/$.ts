import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

/**
 * Menyajikan objek foto dari bucket R2. Kunci dibatasi ke prefix `products/`
 * supaya route ini tidak bisa dipakai membaca objek lain di bucket.
 */
export const Route = createFileRoute("/api/photos/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = decodeURIComponent(url.pathname.replace(/^\/api\/photos\//, ""));

        if (!key.startsWith("products/") || key.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const object = await env.PHOTOS.get(key);
        if (!object) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "public, max-age=31536000, immutable");

        return new Response(object.body, { headers });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

import { siteUrl } from "../utils/seo";

/**
 * robots.txt dilayani sebagai route supaya baris `Sitemap:` memakai origin
 * absolut — protokol sitemap mewajibkan URL lengkap, sedangkan file statis
 * di `public/` tidak tahu domain yang sedang melayani.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const origin = siteUrl().replace(/\/$/, "");
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

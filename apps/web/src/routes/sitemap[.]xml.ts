import { appRouter } from "@delisert.mks-1/api/routers/index";
import { createFileRoute } from "@tanstack/react-router";

import { createContext } from "../context";
import { siteUrl } from "../utils/seo";

const STATIC_PATHS = ["/", "/tentang", "/menu", "/jadwal", "/kontak"] as const;

/**
 * Sitemap dinamis: daftar produk dibaca dari database, jadi produk baru
 * langsung masuk tanpa mengubah file statis (FR-014).
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const caller = appRouter.createCaller(await createContext({ req: request }));
        const products = await caller.product.list();
        const origin = siteUrl().replace(/\/$/, "");

        const paths = [
          ...STATIC_PATHS,
          ...products.map((product) => `/menu/${product.slug}`),
        ];

        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
          "</urlset>",
        ].join("\n");

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

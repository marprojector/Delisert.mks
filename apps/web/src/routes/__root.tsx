import type { AppRouter } from "@delisert.mks-1/api/routers/index";
import { Toaster } from "@delisert.mks-1/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Link, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import Header from "../components/header";
import { SkipLink } from "../components/skip-link";
import { localBusinessJsonLd } from "../utils/seo";

import appCss from "../index.css?url";
export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

const FONT_LINKS: Array<{
  rel: string;
  href: string;
  crossOrigin?: "anonymous" | "use-credentials";
}> = [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..600&family=Plus+Jakarta+Sans:wght@300..700&display=swap",
  },
];

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Delisert — Mochi & Dessert Makassar | Sejak 2021" },
      {
        name: "description",
        content:
          "Delisert — dessert dan makanan homemade Makassar sejak 2021. Mochi, pancake durian, mango sticky rice, mille crepes, Dubai chewy cookie, dan slice cake. Pesan via WhatsApp.",
      },
      { name: "theme-color", content: "#8c3b44" },
      { property: "og:locale", content: "id_ID" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Delisert" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, ...FONT_LINKS],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd()),
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <SkipLink />
        <div className="flex min-h-svh flex-col">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="cn-font-display text-xl text-primary">Delisert</span>
            <p className="text-sm/relaxed text-muted-foreground">
              Dessert & makanan homemade Makassar. Berdiri sejak 2021.
            </p>
          </div>

          <nav aria-label="Navigasi footer" className="flex flex-col gap-2">
            <h2 className="cn-eyebrow text-muted-foreground">Navigasi</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="text-muted-foreground hover:text-primary">
                  Tentang
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-muted-foreground hover:text-primary">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/jadwal" className="text-muted-foreground hover:text-primary">
                  Jadwal & Lokasi
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="text-muted-foreground hover:text-primary">
                  Kontak
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex flex-col gap-2">
            <h2 className="cn-eyebrow text-muted-foreground">Kontak</h2>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://wa.me/6285190021421"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  WhatsApp 0851 9002 1421
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/delisert.mks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Instagram @delisert.mks
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@delisert.mkss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  TikTok @delisert.mkss
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="cn-eyebrow text-muted-foreground">Alamat Operasional</h2>
            <address className="text-sm/relaxed text-muted-foreground not-italic">
              Perumahan Villa Surya Mas, Cluster Harmonis 20,
              <br />
              Jalan Toddopuli Raya Timur No. 20,
              <br />
              RT.1/RW.24, Borong, Manggala,
              <br />
              Makassar, Sulawesi Selatan
            </address>
            <p className="text-xs text-muted-foreground/80">
              Alamat operasional dapur — bukan toko ritel publik.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Delisert. Seluruh hak cipta dilindungi.</p>
          <p>Dibuat dengan sepuluh jari di Makassar.</p>
        </div>
      </div>
    </footer>
  );
}

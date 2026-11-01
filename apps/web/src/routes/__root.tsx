import type { AppRouter } from "@delisert.mks-1/api/routers/index";
import { Toaster } from "@delisert.mks-1/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { FloatingWhatsApp } from "../components/floating-whatsapp";
import { Footer } from "../components/footer";
import Header from "../components/header";
import { AnnouncementBar } from "../components/announcement-bar";
import { SkipLink } from "../components/skip-link";
import { motionGateScript } from "../lib/motion-gate";
import { analyticsScripts } from "../utils/analytics";
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
      // viewport-fit=cover: env(safe-area-inset-*) baru bernilai di HP berponi.
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Delisert — Mochi & Dessert Makassar | Sejak 2021" },
      {
        name: "description",
        content:
          "Delisert — dessert dan makanan homemade Makassar sejak 2021. Mochi, pancake durian, mango sticky rice, mille crepes, Dubai chewy cookie, dan slice cake. Pesan via WhatsApp.",
      },
      { name: "theme-color", content: "#84343e" },
      { property: "og:locale", content: "id_ID" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Delisert" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, ...FONT_LINKS],
    scripts: [
      // Harus paling awal: menyembunyikan elemen beranimasi sebelum cat pertama.
      { children: motionGateScript() },
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd()),
      },
      ...analyticsScripts(),
    ],
  }),

  // Konten website dipakai header, footer, dan semua halaman publik.
  loader: async ({ context }) => {
    await context.queryClient
      .ensureQueryData({ ...context.trpc.site.content.queryOptions(), staleTime: 60_000 })
      .catch(() => undefined);
  },

  component: RootDocument,
});

function RootDocument() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // Admin punya kerangka sendiri; detail produk punya bar pesan sendiri.
  const isAdmin = pathname.startsWith("/admin");
  const isProductDetail = /^\/menu\/[^/]+\/?$/.test(pathname);
  const showFloatingWhatsApp = !isAdmin && !isProductDetail;

  return (
    // Skrip gerbang animasi menambah kelas ke <html> sebelum hydration.
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <SkipLink />
        <div className="flex min-h-svh flex-col">
          {isAdmin ? null : <AnnouncementBar />}
          {isAdmin ? null : <Header />}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1"
          >
            <Outlet />
          </main>
          {/* Di HP, tombol WA melayang / bar pesan detail menutupi bagian bawah footer. */}
          {isAdmin ? null : <Footer phoneBottomGap={showFloatingWhatsApp || isProductDetail} />}
          <FloatingWhatsApp hidden={!showFloatingWhatsApp} />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}

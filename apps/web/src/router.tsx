import type { AppRouter } from "@delisert.mks-1/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink, httpLink, splitLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { readAdminToken } from "./utils/admin-client";
import { TRPCProvider } from "./utils/trpc";

/**
 * Saat SSR, `fetch` Node menolak URL relatif, jadi request tRPC harus memakai
 * origin absolut dari request yang sedang diproses. Di browser cukup relatif
 * agar tetap mengikuti origin halaman (termasuk preview deployment).
 */
const getTrpcUrl = createIsomorphicFn()
  .server(() => {
    const url = getRequestUrl({ xForwardedHost: true });
    return `${url.origin}/api/trpc`;
  })
  .client(() => "/api/trpc");

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        toast.error(error.message, {
          action: {
            label: "retry",
            onClick: () => {
              query.invalidate();
            },
          },
        });
      },
    }),
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  });
}

// Token admin hanya ada di sessionStorage browser; saat SSR nilainya
// kosong, jadi tidak ada kebocoran kredensial ke render server.
const adminAuthHeaders = () => {
  const token = readAdminToken();
  return token ? { authorization: `Bearer ${token}` } : ({} as Record<string, string>);
};

export const getRouter = () => {
  // Dibuat per pemanggilan getRouter (per request di server) supaya
  // getRequestUrl() di dalam getTrpcUrl() punya konteks request yang benar.
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      // Analitik memanggil API Cloudflare (lebih lambat): kirim terpisah
      // supaya query lain dalam batch yang sama tidak ikut menunggu.
      splitLink({
        condition: (operation) => operation.path.startsWith("adminAnalytics."),
        true: httpLink({ url: getTrpcUrl(), headers: adminAuthHeaders }),
        false: httpBatchLink({ url: getTrpcUrl(), headers: adminAuthHeaders }),
      }),
    ],
  });

  const queryClient = createQueryClient();
  const trpc = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient,
  });

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    // Pindah halaman langsung ke atas, bukan scroll halus melewati seluruh isi.
    scrollRestorationBehavior: "instant",
    defaultPreloadStaleTime: 0,
    context: { trpc, queryClient },
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <NotFoundPage />,
    Wrap: ({ children }) => (
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

function NotFoundPage() {
  return (
    <div className="cn-shell flex flex-col items-center gap-4 py-24 text-center lg:py-32">
      <span
        aria-hidden="true"
        className="flex size-36 items-center justify-center rounded-full bg-secondary cn-font-display text-6xl font-semibold text-primary"
      >
        404
      </span>
      <h1 className="pt-2 text-[1.75rem] leading-tight font-semibold text-foreground lg:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-sm text-[0.9375rem]/relaxed text-muted-foreground">
        Alamat yang kamu tuju tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        to="/menu"
        className="mt-2 inline-flex h-[3.25rem] w-full max-w-[21rem] items-center justify-center rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Lihat menu
      </Link>
      <Link to="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">
        Kembali ke beranda
      </Link>
    </div>
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

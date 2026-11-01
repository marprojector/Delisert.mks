import type { AppRouter } from "@delisert.mks-1/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
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

export const getRouter = () => {
  // Dibuat per pemanggilan getRouter (per request di server) supaya
  // getRequestUrl() di dalam getTrpcUrl() punya konteks request yang benar.
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: getTrpcUrl(),
        // Token admin hanya ada di sessionStorage browser; saat SSR nilainya
        // kosong, jadi tidak ada kebocoran kredensial ke render server.
        headers: () => {
          const token = readAdminToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
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
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="cn-eyebrow text-primary">404</p>
      <h1 className="text-3xl leading-tight text-balance sm:text-4xl">Halaman tidak ditemukan.</h1>
      <p className="text-sm/relaxed text-muted-foreground">
        Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan. Kembali ke beranda atau jelajahi
        katalog menu Delisert.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex h-10 items-center border border-primary bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Kembali ke Beranda
        </Link>
        <Link
          to="/menu"
          className="inline-flex h-10 items-center border border-border px-5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          Lihat Menu
        </Link>
      </div>
    </div>
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

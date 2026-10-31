import type { AppRouter } from "@delisert.mks-1/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { TRPCProvider } from "./utils/trpc";

function getTrpcUrl(): string {
  // Path relatif: browser memakai origin halaman, SSR memakai origin server yang sama.
  return "/api/trpc";
}

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

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
    }),
  ],
});

export const getRouter = () => {
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

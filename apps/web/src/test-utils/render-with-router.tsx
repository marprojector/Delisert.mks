import type { AppRouter } from "@delisert.mks-1/api/routers/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { TRPCProvider } from "@/utils/trpc";

/**
 * Render markup statis untuk komponen yang memakai <Link> dan query tRPC.
 * Query tidak pernah dijalankan saat render statis, jadi komponen memakai
 * nilai bawaan (mis. konten website bawaan).
 */
export async function renderWithRouter(node: ReactNode, path = "/"): Promise<string> {
  const queryClient = new QueryClient();
  const trpcClient = createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: "http://localhost/api/trpc" })],
  });
  const rootRoute = createRootRoute({ component: () => <>{node}</> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <RouterProvider router={router} />
      </TRPCProvider>
    </QueryClientProvider>,
  );
}

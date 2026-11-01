import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Render markup statis untuk komponen yang memakai <Link>, di dalam router memori. */
export async function renderWithRouter(node: ReactNode, path = "/"): Promise<string> {
  const rootRoute = createRootRoute({ component: () => <>{node}</> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return renderToStaticMarkup(<RouterProvider router={router} />);
}

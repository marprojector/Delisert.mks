import type { inferRouterOutputs } from "@trpc/server";

import { publicProcedure, router } from "../index";
import { adminAuthRouter } from "./admin-auth";
import { adminCategoryRouter } from "./admin-category";
import { adminActivityRouter, adminAnalyticsRouter, adminMcpRouter } from "./admin-insights";
import { adminProductRouter } from "./admin-product";
import { productRouter } from "./product";
import { scheduleRouter } from "./schedule";
import { adminSiteRouter, siteRouter } from "./site";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  product: productRouter,
  schedule: scheduleRouter,
  adminAuth: adminAuthRouter,
  adminProduct: adminProductRouter,
  site: siteRouter,
  adminSite: adminSiteRouter,
  adminCategory: adminCategoryRouter,
  adminAnalytics: adminAnalyticsRouter,
  adminActivity: adminActivityRouter,
  adminMcp: adminMcpRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

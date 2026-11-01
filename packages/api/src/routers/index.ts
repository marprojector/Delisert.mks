import type { inferRouterOutputs } from "@trpc/server";

import { publicProcedure, router } from "../index";
import { adminAuthRouter } from "./admin-auth";
import { productRouter } from "./product";
import { scheduleRouter } from "./schedule";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  product: productRouter,
  schedule: scheduleRouter,
  adminAuth: adminAuthRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

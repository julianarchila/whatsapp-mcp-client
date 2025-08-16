import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";

import { integrationRouter } from "./integration";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  integration: integrationRouter,
});
export type AppRouter = typeof appRouter;

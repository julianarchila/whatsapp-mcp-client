import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";

import { toolRouter } from "./tool";

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
  tool: toolRouter,
});
export type AppRouter = typeof appRouter;

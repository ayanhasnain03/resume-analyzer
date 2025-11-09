import { recuiterProcedure } from "@/modules/recuiter/server/procedure";
import { createTRPCRouter } from "@/trpc/init";
export const appRouter = createTRPCRouter({
  recuiter: recuiterProcedure,
});
// export type definition of API
export type AppRouter = typeof appRouter;

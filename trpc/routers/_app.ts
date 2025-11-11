import { recuiterProcedure } from "@/modules/recuiter/server/procedure";
import { createTRPCRouter } from "@/trpc/init";
import { jobsProcedure } from "@/modules/jobs/server/procedure";
import { interviewProcedure } from "@/modules/interview/server/procedure";
export const appRouter = createTRPCRouter({
  recuiter: recuiterProcedure,
  jobs: jobsProcedure,
  interview: interviewProcedure,
});
// export type definition of API
export type AppRouter = typeof appRouter;

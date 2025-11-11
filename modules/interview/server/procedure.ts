import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const interviewProcedure = createTRPCRouter({
  getInterview: protectedProcedure
    .input(
      z.object({
        interviewId: z.string().min(1, "Interview id is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { interviewId } = input;
      const interview = await db.interview.findUnique({
        where: { id: interviewId },
        select: {
          id: true,
          questions: true,
          duration: true,
          expiresAt: true,
          jobOpeningId: true,
          jobOpening: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }
      const isShortlisted = await db.jobApplicant.findFirst({
        where: {
          jobOpeningId: interview.jobOpeningId,
          userId: ctx.auth.session.userId,
        },
      });
      if (!isShortlisted) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not shortlisted for this job",
        });
      }
      return {
        interview,
        jobOpening: interview.jobOpening,
      };
    }),
});

import db from "@/lib/db";
import { JobOpeningLocation, Prisma } from "@/lib/generated/prisma/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const jobsProcedure = createTRPCRouter({
  getJobOpening: baseProcedure
    .input(
      z.object({
        jobOpeningId: z.string().min(1, "Job opening id is required"),
      })
    )
    .query(async ({ input }) => {
      const { jobOpeningId } = input;
      const jobOpening = await db.jobOpening.findUnique({
        where: { id: jobOpeningId },
      });
      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }
      return jobOpening;
    }),
  getJobs: baseProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;
      const skip = (page - 1) * pageSize;
      const whereClause: Prisma.JobOpeningWhereInput = {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { about: { contains: search, mode: "insensitive" } },
                { department: { contains: search, mode: "insensitive" } },
                { location: { equals: search as JobOpeningLocation } },
                { experienceLevel: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [jobs, total] = await Promise.all([
        db.jobOpening.findMany({
          where: whereClause,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
          include: {
            _count: {
              select: {
                JobApplicants: true,
              },
            },
          },
        }),
        db.jobOpening.count({
          where: whereClause,
        }),
      ]);
      return {
        jobs: jobs ?? [],
        total: total ?? 0,
      };
    }),
});

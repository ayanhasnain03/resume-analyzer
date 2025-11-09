import { createTRPCRouter, isRecuiterProcedure } from "@/trpc/init";
import { createJobOpeningInput } from "../schema";
import db from "@/lib/db";
import z from "zod";
import {
  DEFAULT_JOB_OPENING_MAX_PAGE_SIZE,
  DEFAULT_JOB_OPENING_MIN_PAGE_SIZE,
  DEFAULT_JOB_OPENING_PAGE,
  DEFAULT_JOB_OPENING_PAGE_SIZE,
} from "../constants";
import {
  JobOpeningLocation,
  JobType,
  Currency,
  Prisma,
} from "@/lib/generated/prisma/client";

export const recuiterProcedure = createTRPCRouter({
  getMany: isRecuiterProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_JOB_OPENING_PAGE),
        pageSize: z
          .number()
          .min(DEFAULT_JOB_OPENING_MIN_PAGE_SIZE)
          .max(DEFAULT_JOB_OPENING_MAX_PAGE_SIZE)
          .default(DEFAULT_JOB_OPENING_PAGE_SIZE),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const skip = (page - 1) * pageSize;
      const whereClause: Prisma.JobOpeningWhereInput = {
        postedBy: ctx?.auth?.session.userId,
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
  create: isRecuiterProcedure
    .input(createJobOpeningInput)
    .mutation(async ({ ctx, input }) => {
      const {
        salaryRange,
        requiredSkills,
        title,
        about,
        department,
        location,
        experienceLevel,
        jobType,
        currency,
        currencySymbol,
        companyName,
        companyAddress,
        companyLogo,
        aboutCompany,
        companySize,
        companyWebsite,
        filteringDescription,
      } = input;

      const createdJobOpening = await db.jobOpening.create({
        data: {
          companyName,
          companyAddress,
          companyLogo: companyLogo
            ? JSON.stringify({
                url: companyLogo.url,
                publicId: companyLogo.publicId,
              })
            : undefined,
          aboutCompany,
          companySize,
          companyWebsite,
          filteringDescription,
          title,
          about,
          department,
          location: location as JobOpeningLocation,
          experienceLevel,
          jobType: (jobType ?? JobType.FULL_TIME) as JobType,
          currency: (currency ?? Currency.USD) as Currency,
          currencySymbol,
          requiredSkills: requiredSkills ?? [],
          salaryRange: salaryRange
            ? {
                min: salaryRange.min,
                max: salaryRange.max,
              }
            : undefined,
          postedBy: ctx?.auth?.session.userId,
        } as unknown as Prisma.JobOpeningUncheckedCreateInput,
      });
      return createdJobOpening;
    }),
});

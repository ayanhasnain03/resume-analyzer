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
  JobOpening,
} from "@/lib/generated/prisma/client";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";

export const recuiterProcedure = createTRPCRouter({
  getJobOpening: isRecuiterProcedure
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
      return (jobOpening as JobOpening) ?? [];
    }),
  generateInterviewQuestions: isRecuiterProcedure
    .input(
      z.object({
        jobOpeningId: z.string().min(1, "Job opening id is required"),
        duration: z.number().min(1, "Duration is required"),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { jobOpeningId, duration, expiresAt } = input;
      const expiresAtDate = new Date(
        expiresAt || Date.now() + 2 * 24 * 60 * 60 * 1000
      );

      const jobOpening = await db.jobOpening.findUnique({
        where: {
          id: jobOpeningId,
        },
        select: {
          requiredSkills: true,
          title: true,
          experienceLevel: true,
          jobType: true,
          about: true,
        },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }
      const interviewQuestionAlredyExists = await db.interview.findFirst({
        where: {
          jobOpeningId,
        },
      });
      if (interviewQuestionAlredyExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview questions already exists",
        });
      }
      const interview = await db.interview.create({
        data: {
          jobOpeningId,
          duration: duration * 60,
          expiresAt: expiresAtDate,
          questions: [],
        },
      });

      // Send event to Inngest with interviewId so it can update the interview
      await inngest.send({
        name: "recuiter/generate-interview-question",
        data: {
          interviewId: interview.id,
          jobOpeningId,
          requiredSkills: jobOpening.requiredSkills as string[],
          title: jobOpening.title,
          experienceLevel: jobOpening.experienceLevel as string,
          jobType: jobOpening.jobType as JobType,
          about: jobOpening.about,
          duration: duration * 60,
          expiresAt: expiresAtDate,
        },
      });

      return {
        id: interview.id,
        questions: interview.questions,
      };
    }),
  getInterview: isRecuiterProcedure
    .input(
      z.object({
        interviewId: z.string().min(1, "Interview id is required"),
      })
    )
    .query(async ({ input }) => {
      const { interviewId } = input;
      const interview = await db.interview.findUnique({
        where: { id: interviewId },
      });
      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }
      return interview;
    }),
  getInterviews: isRecuiterProcedure
    .input(
      z.object({
        jobOpeningId: z.string().min(1, "Job opening id is required"),
      })
    )
    .query(async ({ input }) => {
      const { jobOpeningId } = input;
      const interviews = await db.interview.findMany({
        where: { jobOpeningId },
      });
      return interviews;
    }),
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

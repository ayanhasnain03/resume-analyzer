import { Currency, JobType } from "@/lib/generated/prisma/enums";
import { z } from "zod";

export const createJobOpeningInput = z.object({
  title: z.string().min(6, "Title too short, at least 6 letters."),
  about: z.string().min(6, "About too short, at least 6 letters."),
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyLogo: z
    .object({
      url: z.string().min(1, "Company logo url is required"),
      publicId: z.string().optional(),
    })
    .optional(),
  aboutCompany: z.string().min(1, "About company is required"),
  companySize: z.string().min(1, "Company size is required"),
  companyWebsite: z.string().min(1, "Company website is required"),
  filteringDescription: z.string().min(1, "Filtering description is required"),
  department: z.string().min(1, "Department is required"),
  location: z.enum(["REMOTE", "OFFICE", "HYBRID"], "Location is required"),
  experienceLevel: z.string().min(1, "Add Experience"),
  requiredSkills: z.array(z.string()).optional(),
  salaryRange: z
    .object({
      min: z.string().min(0, "Minimum salary is required"),
      max: z.string().min(0, "Maximum salary is required").optional(),
    })
    .optional(),
  jobType: z
    .enum([
      JobType.FULL_TIME,
      JobType.PART_TIME,
      JobType.CONTRACT,
      JobType.TEMPORARY,
    ])
    .default(JobType.FULL_TIME)
    .optional(),
  currency: z
    .enum([
      Currency.USD,
      Currency.EUR,
      Currency.GBP,
      Currency.INR,
      Currency.CAD,
      Currency.AUD,
      Currency.NZD,
    ])
    .default(Currency.USD)
    .optional(),
  currencySymbol: z.string().min(1, "Currency symbol is required").optional(),
});

export type CreateJobOpeningInput = z.infer<typeof createJobOpeningInput>;

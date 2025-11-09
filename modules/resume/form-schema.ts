import z from "zod";

export const resumeFormSchema = z.object({
  jobTitle: z.string().min(1, { message: "Job title is required" }),
  jobDescription: z.string().min(1, { message: "Job description is required" }),
  file: z
    .instanceof(File, {
      message: "File is required",
    })
    .refine((value) => value.size > 0, {
      message: "File is required",
    })
    .refine((value) => value.type === "application/pdf", {
      message: "File must be a PDF",
    }),
});

export type ResumeFormSchema = z.infer<typeof resumeFormSchema>;

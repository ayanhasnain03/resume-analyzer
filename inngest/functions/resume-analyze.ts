import { inngest } from "@/inngest/client";
import OpenAI from "openai";
import { prepareInstructions } from "@/modules/resume/constants";
import { extractText } from "@/lib/extract-text";
import db from "@/lib/db";
import {
  InterviewStatus,
  JobApplicantStatus,
} from "@/lib/generated/prisma/enums";
import { JsonObject } from "@prisma/client/runtime/library";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeResume({
  resumeText,
  jobTitle,
  jobDescription,
}: {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
}) {
  const truncatedResumeText =
    resumeText.length > 4000
      ? `${resumeText.substring(0, 4000)}...[truncated]`
      : resumeText;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: prepareInstructions({
          jobTitle,
          jobDescription,
        }),
      },
      {
        role: "user",
        content: `Analyze this resume and provide feedback:\n\n${truncatedResumeText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No content found in OpenAI response");

  const parsedFeedback = JSON.parse(content);

  return {
    success: true,
    data: {
      resumeText,
      feedback: {
        overallScore: parsedFeedback.overallScore,
        ATS: parsedFeedback.ATS,
        toneAndStyle: parsedFeedback.toneAndStyle,
        content: parsedFeedback.content,
        structure: parsedFeedback.structure,
        skills: parsedFeedback.skills,
      },
    },
  };
}

export const resumeAnalyze = inngest.createFunction(
  { id: "user/resume-analyze" },
  { event: "user.resume-analyze" },
  async ({ event, step }) => {
    const { file, jobTitle, jobDescription } = event.data;

    // 1️⃣ Extract text
    const resumeText = await step.run("extract-resume-text", async () => {
      return await extractText(file);
    });

    // 2️⃣ Generate feedback
    const generateFeedback = await step.run("generate-feedback", async () => {
      return await analyzeResume({
        resumeText,
        jobTitle,
        jobDescription,
      });
    });

    await step.run("save-feedback-to-db", async () => {
      const jobApplicant = await db.jobApplicant.create({
        data: {
          resume: resumeText,
          feedbackResume: generateFeedback.data.feedback,
          status: JobApplicantStatus.PENDING,
          jobOpeningId: event.data.jobOpeningId,
          userId: event.data.userId,
        },
      });
      const feedbackData = jobApplicant.feedbackResume as JsonObject;
      const overallScore = feedbackData?.overallScore as number | undefined;

      if (overallScore && overallScore >= 40) {
        await db.jobApplicant.update({
          where: { id: jobApplicant.id },
          data: { status: JobApplicantStatus.SELECTED },
        });

        await db.jobApplicantInterview.create({
          data: {
            jobApplicantId: jobApplicant.id,
            jobOpeningId: jobApplicant.jobOpeningId,
            status: InterviewStatus.PENDING,
          },
        });
      } else {
        await db.jobApplicant.update({
          where: { id: jobApplicant.id },
          data: { status: JobApplicantStatus.REJECTED },
        });
      }
    });
    return generateFeedback;
  }
);

import { inngest } from "@/inngest/client";
import OpenAI from "openai";
import { prepareInstructions } from "@/modules/resume/constants";
import { extractText } from "@/lib/extract-text";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Core function that can be called directly or through Inngest
export async function analyzeResume({
  resumeText,
  jobTitle,
  jobDescription,
}: {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
}) {
  // Truncate resume text if too long (limit to ~4000 chars for faster processing)
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
    temperature: 0, // Faster, deterministic responses
    max_tokens: 2000, // Limit response size for faster generation
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content found in OpenAI response");
  }

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
  {
    id: "user/resume-analyze",
  },
  {
    event: "user/resume-analyze",
  },
  async ({ event, step }) => {
    const { file, jobTitle, jobDescription } = event.data;
    const resumeText = await step.run("extract-resume-text", async () => {
      return await extractText(file);
    });
    const generateFeedback = await step.run("generate-feedback", async () => {
      return await analyzeResume({
        resumeText,
        jobTitle,
        jobDescription,
      });
    });
    return generateFeedback.data;
  }
);

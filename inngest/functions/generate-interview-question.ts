import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import OpenAI from "openai";
import { GENERATE_INTERVIEW_QUESTIONS_PROMPT } from "@/modules/recuiter/constants";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for generated questions
const QuestionSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  category: z.enum([
    "technical",
    "behavioral",
    "problem-solving",
    "scenario",
    "motivation",
  ]),
  focusArea: z.string().min(1, "Focus area is required"),
  expectedDuration: z.string().optional(),
});

const QuestionsResponseSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .min(1, "At least one question is required"),
});

export const generateInterviewQuestions = inngest.createFunction(
  {
    id: "recuiter/generate-interview-question",
    retries: 3,
  },
  {
    event: "recuiter/generate-interview-question",
  },
  async ({ event, step }) => {
    const {
      interviewId,
      requiredSkills,
      title,
      experienceLevel,
      jobType,
      about,
      duration,
    } = event.data;

    if (!interviewId) {
      throw new Error("Interview ID is required");
    }
    const prompt = GENERATE_INTERVIEW_QUESTIONS_PROMPT.replace(
      "{{duration}}",
      duration.toString()
    )
      .replace("{{requiredSkills}}", requiredSkills.join(", "))
      .replace("{{title}}", title)
      .replace("{{experienceLevel}}", experienceLevel)
      .replace("{{jobType}}", jobType)
      .replace("{{about}}", about || "");

    const response = await step.run(
      "generate-interview-questions",
      async () => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert interview question generator. Always return valid JSON with a 'questions' array containing question objects.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 2000,
          });

          return completion;
        } catch (error) {
          throw new Error(
            `Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content found in OpenAI response");
    }

    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : "Invalid JSON"}`
      );
    }
    const validatedQuestions = await step.run(
      "validate-questions",
      async () => {
        try {
          const validated = QuestionsResponseSchema.parse(parsedContent);
          return validated.questions;
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(
              (issue) => `${issue.path.join(".")}: ${issue.message}`
            );
            throw new Error(
              `Invalid questions structure: ${errorMessages.join(", ")}`
            );
          }
          throw error;
        }
      }
    );
    await step.run("save-questions-to-database", async () => {
      try {
        const interview = await db.interview.findUnique({
          where: { id: interviewId },
        });

        if (!interview) {
          throw new Error(`Interview with ID ${interviewId} not found`);
        }

        const updated = await db.interview.update({
          where: { id: interviewId },
          data: {
            questions: validatedQuestions,
          },
        });

        return updated;
      } catch (error) {
        throw new Error(
          `Failed to save questions: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });
  }
);

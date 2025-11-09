import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { sendEmail } from "@/inngest/functions/sendEmail";
import { resumeAnalyze } from "@/inngest/functions/resume-analyze";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendEmail, resumeAnalyze],
});

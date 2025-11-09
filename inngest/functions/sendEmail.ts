import { inngest } from "@/inngest/client";

export const sendEmail = inngest.createFunction(
  {
    id: "send-email",
  },
  {
    event: "user/registered",
  },
  async ({ event, step }) => {
    console.log(`Sending welcome email to ${event.data.email}`);
    await step.sleep("wait-a-bit", "10s");
    console.log("Email sent ✅");

    return { success: true };
  }
);

import { NextRequest, NextResponse } from "next/server";

import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const { file, jobTitle, jobDescription, userId, jobOpeningId } =
      await req.json();
    if (!file || !jobTitle || !jobDescription || !userId || !jobOpeningId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await inngest.send({
      name: "user.resume-analyze",
      data: {
        userId,
        jobOpeningId,
        file,
        jobTitle,
        jobDescription,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

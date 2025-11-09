import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { file, jobTitle, jobDescription } = await req.json();

    const result = await inngest.send({
      name: "user/resume-analyze",
      data: {
        file,
        jobTitle,
        jobDescription,
      },
    });

    return NextResponse.json(result);
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

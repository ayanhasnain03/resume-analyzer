"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const InterviewView = ({ interviewId }: { interviewId: string }) => {
  const trpc = useTRPC();
  useSuspenseQuery(trpc.interview.getInterview.queryOptions({ interviewId }));
  return <div>InterviewView</div>;
};

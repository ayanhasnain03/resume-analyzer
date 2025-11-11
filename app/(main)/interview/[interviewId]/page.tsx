import { InterviewView } from "@/modules/interview/ui/views/interview-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.interview.getInterview.queryOptions({
      interviewId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <InterviewView interviewId={interviewId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}

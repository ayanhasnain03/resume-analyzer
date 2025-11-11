import {
  DashboardInterviewManageView,
  DashboardInterviewManageViewError,
  DashboardInterviewManageViewLoading,
} from "@/modules/recuiter/ui/views/dashboard-interview-manage-view";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function InterviewManagePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.recuiter.getInterviews.queryOptions({
      jobOpeningId: jobId,
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardInterviewManageViewLoading />}>
        <ErrorBoundary fallback={<DashboardInterviewManageViewError />}>
          <DashboardInterviewManageView jobOpeningId={jobId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}

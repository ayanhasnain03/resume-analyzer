import {
  DashboardJobsView,
  DashboardJobsViewError,
  DashboardJobsViewLoading,
} from "@/modules/recuiter/ui/views/dashboard-jobs-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const JobsPage = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.recuiter.getMany.queryOptions({}));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardJobsViewLoading />}>
        <ErrorBoundary fallback={<DashboardJobsViewError />}>
          <DashboardJobsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default JobsPage;

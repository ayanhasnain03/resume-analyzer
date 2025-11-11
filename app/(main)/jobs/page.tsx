import { JobsView } from "@/modules/jobs/ui/views/jobs-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default function JobsPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.jobs.getJobs.queryOptions({
      page: 1,
      pageSize: 10,
      search: undefined,
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobsView />
    </HydrationBoundary>
  );
}

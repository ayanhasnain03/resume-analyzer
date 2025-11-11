import { JobsViewById } from "@/modules/jobs/ui/views/jobs-view-id";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function JobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.jobs.getJobOpening.queryOptions({ jobOpeningId: jobId })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobsViewById jobId={jobId} />
    </HydrationBoundary>
  );
}

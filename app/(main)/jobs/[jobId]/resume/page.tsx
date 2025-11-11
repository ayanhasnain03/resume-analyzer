import { ResumeAnalyzeView } from "@/modules/resume/ui/views/resume-analyze-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
interface ResumePageProps {
  params: Promise<{ jobId: string }>;
}
export default async function ResumePage({ params }: ResumePageProps) {
  const { jobId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.jobs.getJobOpening.queryOptions({ jobOpeningId: jobId })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ResumeAnalyzeView jobId={jobId} />
    </HydrationBoundary>
  );
}

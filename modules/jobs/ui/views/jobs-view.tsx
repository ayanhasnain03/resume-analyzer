"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { JobOpening } from "@/lib/generated/prisma/client";
import { JobCard } from "../components/job-card";

export const JobsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.jobs.getJobs.queryOptions({
      page: 1,
      pageSize: 10,
      search: undefined,
    })
  );
  const { jobs, total } = data as unknown as {
    jobs: (JobOpening & {
      _count?: {
        JobApplicants: number;
      };
    })[];
    total: number;
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold text-foreground">
            No jobs found
          </h3>
          <p className="text-muted-foreground">
            There are currently no job openings available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

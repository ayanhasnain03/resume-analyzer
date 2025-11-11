"use client";
import { CustomBreadcrumbs } from "@/components/custom-breadcrumps";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { JobOpening as JobOpeningType } from "@/lib/generated/prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardJobCard } from "../components/dashboard-job-card";
import { useRouter } from "next/navigation";

type JobOpeningWithCount = JobOpeningType & {
  _count: {
    JobApplicants: number;
  };
};

export const DashboardJobsView = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const { data } = useSuspenseQuery(trpc.recuiter.getMany.queryOptions({})) as {
    data: { jobs: JobOpeningWithCount[]; total: number };
  };

  return (
    <div className="px-8">
      <div className="flex justify-between items-center px-2">
        <CustomBreadcrumbs />
        <Button asChild>
          <Link href="/dashboard/jobs/create">Add Jobs</Link>
        </Button>{" "}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 py-4">
        {data?.jobs?.map((job: JobOpeningWithCount) => (
          <DashboardJobCard
            key={job.id}
            totalApplicants={job._count.JobApplicants ?? 0}
            companyLogo={job.companyLogo ?? ""}
            companyName={job.companyName ?? ""}
            companyAddress={job.companyAddress ?? ""}
            salaryRange={
              (job.salaryRange as { min: string; max: string } | undefined) ?? {
                min: "0",
                max: "0",
              }
            }
            companySize={job.companySize ?? ""}
            id={job.id}
            title={job.title}
            description={job.aboutCompany ?? ""}
            location={job.location}
            experienceLevel={job.experienceLevel}
            status={job.status}
            requiredSkills={job.requiredSkills as string[]}
            department={job.department}
            createdAt={job.createdAt}
            onEdit={() => {}}
            onDelete={() => {}}
            onInterviewManagement={() =>
              router.push(`/dashboard/jobs/${job.id}/interview-manage`)
            }
          />
        ))}
      </div>
    </div>
  );
};
export const DashboardJobsViewLoading = () => {
  return (
    <div className="px-8">
      <div className="flex justify-between items-center px-2">Loading...</div>
    </div>
  );
};
export const DashboardJobsViewError = () => {
  return (
    <div className="px-8">
      <div className="flex justify-between items-center px-2">
        <p>Error loading jobs</p>
      </div>
    </div>
  );
};

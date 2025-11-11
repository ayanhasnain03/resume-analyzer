"use client";
import { CustomBreadcrumbs } from "@/components/custom-breadcrumps";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DashboardInterviewManageScheduleModal } from "../components/dashboard-interview-manage-schedule-modal";
import { useParams } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { InterviewQuestion } from "@/modules/recuiter/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileQuestion, Plus, RefreshCw, Target } from "lucide-react";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    technical:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    behavioral:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    "problem-solving":
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    scenario:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    motivation:
      "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  };
  return (
    colors[category] ||
    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800"
  );
};

export const DashboardInterviewManageView = ({
  jobOpeningId,
}: {
  jobOpeningId: string;
}) => {
  const trpc = useTRPC();
  const [openScheduleModal, setOpenScheduleModal] = useState<boolean>(false);

  const queryOptions = trpc.recuiter.getInterviews.queryOptions({
    jobOpeningId,
  });

  const {
    data: interviews,
    isLoading,
    isFetching,
  } = useSuspenseQuery({
    ...queryOptions,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasGenerating = data.some((interview: { questions: unknown }) => {
        const questions = interview.questions as unknown[];
        return (
          !questions || (Array.isArray(questions) && questions.length === 0)
        );
      });
      return hasGenerating ? 2000 : false;
    },
  });

  const currentInterview = interviews?.[0];
  const questions = Array.isArray(currentInterview?.questions)
    ? (currentInterview.questions as InterviewQuestion[])
    : [];
  const isGenerating = questions.length === 0 && currentInterview;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <CustomBreadcrumbs />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6 border-b">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Interview Management
            </h1>
            <p className="text-muted-foreground text-sm">
              {questions.length > 0
                ? `${questions.length} question${questions.length !== 1 ? "s" : ""} prepared`
                : "Manage your interview questions"}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setOpenScheduleModal(true)}
            className="w-full sm:w-auto shrink-0"
          >
            {interviews && interviews.length > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Interview
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Interview
              </>
            )}
          </Button>
        </div>

        <div className="py-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !currentInterview ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  No Interview Scheduled
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Get started by scheduling an interview. We&apos;ll generate
                  tailored questions based on your job requirements.
                </p>
                <Button onClick={() => setOpenScheduleModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Your First Interview
                </Button>
              </CardContent>
            </Card>
          ) : isGenerating ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <Spinner className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Generating Questions
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  We&apos;re crafting personalized interview questions for you.
                  This may take a few moments...
                </p>
              </CardContent>
            </Card>
          ) : questions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  No Questions Available
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  The interview has been scheduled but questions are not yet
                  available.
                </p>
                <Button
                  onClick={() => setOpenScheduleModal(true)}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {isFetching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 px-1">
                  <Spinner className="h-4 w-4" />
                  <span>Updating questions...</span>
                </div>
              )}
              {questions.map((question: InterviewQuestion, index: number) => (
                <Card
                  key={`${question.question}-${index}`}
                  className="transition-all hover:shadow-md border-l-4 border-l-primary/20"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-full bg-primary text-primary-foreground size-10 flex items-center justify-center font-semibold text-sm shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <CardTitle className="text-lg leading-relaxed font-semibold">
                          {question.question}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${getCategoryColor(question.category)} border font-medium`}
                          >
                            {question.category
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </Badge>
                          {question.focusArea && (
                            <Badge
                              variant="secondary"
                              className="gap-1.5 font-medium"
                            >
                              <Target className="h-3 w-3" />
                              {question.focusArea}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {question.focusArea && (
                    <CardContent className="pt-0">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 border border-border/50">
                        <Target className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <div>
                          <span className="font-semibold text-foreground">
                            Focus Area:
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {question.focusArea}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <DashboardInterviewManageScheduleModal
        jobOpeningId={jobOpeningId}
        open={openScheduleModal}
        onOpenChange={setOpenScheduleModal}
      />
    </div>
  );
};

export const DashboardInterviewManageViewLoading = () => {
  return <div>Loading...</div>;
};

export const DashboardInterviewManageViewError = () => {
  return <div>Error</div>;
};

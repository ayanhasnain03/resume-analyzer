"use client";

import { useForm } from "@tanstack/react-form";
import { scheduleInterviewInput } from "../../schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { type ScheduleInterviewInput } from "../../schema";
interface DashboardInterviewScheduleFormProps {
  jobOpeningId: string;
  onOpenChange: (open: boolean) => void;
}

export const DashboardInterviewScheduleForm = ({
  jobOpeningId,
  onOpenChange,
}: DashboardInterviewScheduleFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createdInterviewId, setCreatedInterviewId] = useState<string | null>(
    null
  );

  const mutationOptions = useMemo(
    () =>
      trpc.recuiter.generateInterviewQuestions.mutationOptions({
        onSuccess: (data: { id: string }) => {
          setCreatedInterviewId(data.id);
          queryClient.invalidateQueries({
            queryKey: [
              ["recuiter", "getInterviews"],
              { input: { jobOpeningId }, type: "query" },
            ],
          });
          toast.success("Interview created. Generating questions...");
        },
        onError: () => {
          toast.error("Failed to generate interview questions");
          setCreatedInterviewId(null);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, jobOpeningId]
  );

  const generateInterviewQuestionsMutation = useMutation(mutationOptions);

  // Poll for the interview to check if questions are generated
  const { data: interview } = useQuery({
    ...trpc.recuiter.getInterview.queryOptions({
      interviewId: createdInterviewId ?? "",
    }),
    enabled: !!createdInterviewId,
    refetchInterval: (query) => {
      const data = query.state.data as { questions: unknown } | undefined;
      if (!data) return 2000; // Poll every 2 seconds if no data
      const questions = data.questions as unknown[];
      const isGenerating =
        !questions || (Array.isArray(questions) && questions.length === 0);
      // Stop polling if questions are generated
      return isGenerating ? 2000 : false;
    },
  });

  // Close modal when questions are generated
  useEffect(() => {
    if (!interview || !createdInterviewId) return;

    const interviewData = interview as unknown as { questions: unknown };
    const questions = interviewData.questions as unknown[];
    const isGenerating =
      !questions || (Array.isArray(questions) && questions.length === 0);

    if (!isGenerating) {
      queryClient.invalidateQueries({
        queryKey: [
          ["recuiter", "getInterviews"],
          { input: { jobOpeningId }, type: "query" },
        ],
      });
      toast.success("Interview questions generated successfully");
      onOpenChange(false);

      // Reset state after modal closes
      setTimeout(() => {
        setCreatedInterviewId(null);
      }, 0);
    }

    // @ts-expect-error - Type instantiation is excessively deep (known TypeScript limitation with tRPC types)
  }, [interview, createdInterviewId]);
  const form = useForm({
    defaultState: {
      values: {
        jobOpeningId,
        duration: 5,
        expiresAt: new Date(),
      } as ScheduleInterviewInput,
    },
    validators: {
      onSubmit: scheduleInterviewInput,
    },
    onSubmit: async ({ value }) => {
      generateInterviewQuestionsMutation.mutate({
        jobOpeningId,
        duration: value.duration,
        expiresAt: value.expiresAt?.toISOString() ?? undefined,
      });
    },
  });
  // Determine if we're in step 1 (creating interview) or step 2 (generating questions)
  const isCreatingInterview =
    form.state.isSubmitting || generateInterviewQuestionsMutation.isPending;

  const isGeneratingQuestions =
    createdInterviewId !== null &&
    (() => {
      // If interview data hasn't loaded yet, we're still generating
      if (!interview) return true;
      const interviewData = interview as unknown as { questions: unknown };
      const questions = interviewData.questions as unknown[];
      return !questions || (Array.isArray(questions) && questions.length === 0);
    })();

  const isLoading = isCreatingInterview || isGeneratingQuestions;

  // Determine current step for display
  const currentStep = isCreatingInterview
    ? 1
    : isGeneratingQuestions
      ? 2
      : null;

  return (
    <div className="relative">
      <ScrollArea className="h-72 w-full rounded-md border p-4">
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-8">
            <div className="space-y-6">
              <form.Field name="duration">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Duration</FieldLabel>
                      <Select
                        value={(field.state.value as number).toString()}
                        onValueChange={(value) =>
                          field.handleChange(Number(value))
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="expiresAt">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Expires At</FieldLabel>
                      <Calendar
                        mode="single"
                        selected={field.state.value as Date | undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.handleChange(date);
                          } else {
                            field.handleChange(undefined);
                          }
                        }}
                        disabled={(date) =>
                          (date < new Date() || isLoading) ?? false
                        }
                        className="rounded-md border"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </FieldGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                {isCreatingInterview
                  ? "Creating interview..."
                  : "Generating questions..."}
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </ScrollArea>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="size-8" />
            <div className="flex flex-col items-center gap-2">
              {currentStep && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-muted-foreground">
                    Step {currentStep} of 2
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {isCreatingInterview
                  ? "Creating interview..."
                  : isGeneratingQuestions
                    ? "Generating interview questions..."
                    : "Loading..."}
              </p>
              {isGeneratingQuestions && (
                <p className="text-xs text-muted-foreground/80">
                  This may take a few moments...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

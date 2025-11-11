"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Upload, X } from "lucide-react";
import { FormValidateOrFn, useForm } from "@tanstack/react-form";
import { resumeFormSchema } from "../../form-schema";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { JobOpening } from "@/lib/generated/prisma/client";
import { htmlToText } from "html-to-text";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const ResumeAnalyzeView = ({ jobId }: { jobId: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.jobs.getJobOpening.queryOptions({ jobOpeningId: jobId })
  );
  const jobData = data as unknown as JobOpening;
  const jobTitle = jobData?.title ?? "";
  const jobDescription = htmlToText(jobData?.about ?? "");

  const form = useForm({
    defaultState: {
      values: {
        file: undefined as File | undefined,
        jobTitle,
        jobDescription,
        userId: (session?.session?.userId ?? "") as string,
        jobOpeningId: jobId,
      },
    },
    validators: {
      onSubmit: resumeFormSchema as FormValidateOrFn<{
        file: File | undefined;
        jobTitle: string;
        jobDescription: string;
        userId: string;
        jobOpeningId: string;
      }>,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        toast.error("Please select a file");
        return;
      }

      setIsLoading(true);
      try {
        // Convert file to base64
        const file = value.file;
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix if present
            const base64String = result.includes(",")
              ? result.split(",")[1]
              : result;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Call analyze API
        const response = await fetch("/api/resume/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64,
            jobTitle: value.jobTitle,
            jobDescription: value.jobDescription,
            userId: value.userId,
            jobOpeningId: value.jobOpeningId,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            error: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(error.error || "Failed to analyze resume");
        }

        const result = await response.json();
        if (result.success) {
          toast.success("Application submitted successfully!");
          router.push(`/jobs/${jobId}`);
        } else {
          throw new Error(result.error || "Analysis failed");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to analyze resume";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">Resume Analysis</h1>
        <p className="text-muted-foreground">
          Upload your resume to get AI-powered insights and recommendations
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="file">
            {(field) => {
              const isInvalid =
                (field.state.meta.isTouched || form.state.isSubmitted) &&
                !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Resume (PDF)</FieldLabel>
                  <Dropzone
                    accept={{ "application/pdf": [".pdf"] }}
                    maxFiles={1}
                    maxSize={5 * 1024 * 1024} // 5MB
                    minSize={1024}
                    onDrop={(files) => {
                      if (files.length > 0) {
                        field.handleChange(files[0]);
                      }
                    }}
                    onError={(error) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Failed to upload file"
                      );
                    }}
                    src={field.state.value ? [field.state.value] : undefined}
                  >
                    <DropzoneEmptyState />
                    <DropzoneContent
                      onRemove={() => {
                        field.handleChange(undefined);
                      }}
                    />
                  </Dropzone>

                  {field.state.value && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {field.state.value.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {(field.state.value.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              field.handleChange(undefined);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer"
          size="lg"
        >
          {isLoading ? (
            <>Analyzing...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Resume
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

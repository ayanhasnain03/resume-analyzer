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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { resumeFormSchema } from "../../form-schema";
import { toast } from "sonner";

export const ResumeAnalyzeView = () => {
  const form = useForm({
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      file: undefined as unknown as File,
    },
    validators: {
      onSubmit: resumeFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Convert File to base64
        const arrayBuffer = await value.file.arrayBuffer();
        // Use chunks to avoid stack overflow with large files
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64 = btoa(binary);

        const response = await fetch("/api/resume/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64,
            fileName: value.file.name,
            jobTitle: value.jobTitle,
            jobDescription: value.jobDescription,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to analyze resume");
        }

        const result = await response.json();
        console.log(result);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while analyzing your resume"
        );
        throw error;
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
          {/* Job Title Field */}
          <form.Field name="jobTitle">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Job Title</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    aria-invalid={isInvalid}
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Job Description Field */}
          <form.Field name="jobDescription">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Job Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={6}
                    className="min-h-24 resize-none"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* File Upload Field */}
          <form.Field name="file">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
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
                        field.handleChange(undefined as unknown as File);
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
                              field.handleChange(undefined as unknown as File);
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

        {/* Submit Button */}
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
};

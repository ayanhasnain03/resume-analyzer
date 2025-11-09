"use client";
import React from "react";
import numeral from "numeral";
import { useForm } from "@tanstack/react-form";
import {
  CreateJobOpeningInput,
  createJobOpeningInput,
} from "@/modules/recuiter/schema";
import { CustomBreadcrumbs } from "@/components/custom-breadcrumps";
import {
  JobOpeningLocation,
  JobType,
  Currency as CurrencyEnum,
} from "@/lib/generated/prisma/enums";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MinimalTiptap } from "@/components/tip-tap-editor";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_OPENING_DEPARTMENTS,
  JOB_OPENING_EXPERIENCE_LEVELS,
  JOB_OPENING_LOCATIONS,
  JOB_OPENING_REQUIRED_SKILLS,
} from "../../constants";
import { TagsSelector } from "@/components/ui/tags-selector";
import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";

const CURRENCY_SYMBOLS: Record<CurrencyEnum, string> = {
  [CurrencyEnum.USD]: "$",
  [CurrencyEnum.EUR]: "€",
  [CurrencyEnum.GBP]: "£",
  [CurrencyEnum.INR]: "₹",
  [CurrencyEnum.CAD]: "C$",
  [CurrencyEnum.AUD]: "A$",
  [CurrencyEnum.NZD]: "NZ$",
};

const CURRENCY_OPTIONS = [
  { value: CurrencyEnum.USD, label: "USD ($)" },
  { value: CurrencyEnum.EUR, label: "EUR (€)" },
  { value: CurrencyEnum.GBP, label: "GBP (£)" },
  { value: CurrencyEnum.INR, label: "INR (₹)" },
  { value: CurrencyEnum.CAD, label: "CAD (C$)" },
  { value: CurrencyEnum.AUD, label: "AUD (A$)" },
  { value: CurrencyEnum.NZD, label: "NZD (NZ$)" },
];

const JOB_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: "Full Time" },
  { value: JobType.PART_TIME, label: "Part Time" },
  { value: JobType.CONTRACT, label: "Contract" },
  { value: JobType.TEMPORARY, label: "Temporary" },
];

const parseSalary = (value: string): string => {
  if (!value || value.trim() === "") return "0";
  const trimmed = value.trim().toUpperCase();

  if (trimmed.endsWith("K") || trimmed.endsWith("M")) {
    return trimmed;
  }

  const parsed = numeral(trimmed).value();
  if (!parsed) return "0";

  const formatted = numeral(parsed).format("0.0a").toUpperCase();
  return formatted.replace(".0", "");
};

const formatSalary = (value: string | number): string => {
  if (!value || value === "0" || value === 0) return "";

  if (typeof value === "string") {
    const upperValue = value.trim().toUpperCase();
    if (upperValue.endsWith("K") || upperValue.endsWith("M")) {
      return upperValue;
    }
  }

  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num) || num === 0) return "";
  const formatted = numeral(num).format("0.0a").toUpperCase();
  return formatted.replace(".0", "");
};

export const DashboardJobsCreateView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = React.useState<File | undefined>(undefined);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const createJobOpeningMutation = useMutation(
    trpc.recuiter.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.recuiter.getMany.queryOptions({}));
        toast.success("Job opening created successfully");
      },
      onError: () => {
        toast.error("Failed to create job opening");
      },
    })
  );
  const form = useForm({
    defaultState: {
      values: {
        title: "",
        about: "",
        companyName: "",
        companyAddress: "",
        companyLogo: {
          url: "",
          publicId: "",
        } as { url: string; publicId?: string } | undefined,
        aboutCompany: "",
        companySize: "",
        companyWebsite: "",
        filteringDescription: "",
        department: "",
        location: "" as JobOpeningLocation,
        experienceLevel: "",
        requiredSkills: [] as string[],
        salaryRange: {
          min: "0",
          max: "0",
        },
        jobType: JobType.FULL_TIME,
        currency: CurrencyEnum.USD,
        currencySymbol: "$",
      } as CreateJobOpeningInput,
    },
    validators: {
      onSubmit: createJobOpeningInput,
    },
    onSubmit: async ({ value }) => {
      if (value.currency) {
        value.currencySymbol = CURRENCY_SYMBOLS[value.currency] ?? "$";
      }

      if (value.salaryRange) {
        value.salaryRange.min = parseSalary(value.salaryRange.min);
        value.salaryRange.max = value.salaryRange.max
          ? parseSalary(value.salaryRange.max)
          : undefined;
      }

      if (
        value.companyLogo &&
        (value.companyLogo.url === undefined || !value.companyLogo.url?.trim())
      ) {
        value.companyLogo = undefined;
      } else if (value.companyLogo && !value.companyLogo.publicId) {
        delete value.companyLogo.publicId;
      }

      createJobOpeningMutation.mutate(value);
    },
  });
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <CustomBreadcrumbs />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create Job Opening
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in the details to create a new job opening
          </p>
        </div>

        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-8">
            {/* Company Information Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold">Company Information</h2>
                <p className="text-sm text-muted-foreground">
                  Details about your company
                </p>
              </div>

              <form.Field name="companyName">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., Acme Corporation"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="companyAddress">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Company Address
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., 123 Main St, City, State, ZIP"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="companyLogo.url">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const logoValue = form.state.values.companyLogo;

                  const handleFileUpload = async (file: File) => {
                    setLogoFile(file);
                    setIsUploadingLogo(true);

                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("folder", "company-logos");

                      const response = await fetch("/api/upload/file", {
                        method: "POST",
                        body: formData,
                      });

                      if (!response.ok) {
                        const error = await response.json().catch(() => ({
                          error: `HTTP ${response.status}: ${response.statusText}`,
                        }));
                        throw new Error(error.error || "Failed to upload file");
                      }

                      const result = await response.json();

                      if (result && result.url && result.publicId) {
                        form.setFieldValue("companyLogo", {
                          url: result.url,
                          publicId: result.publicId,
                        });
                        toast.success("Logo uploaded successfully");
                      } else {
                        throw new Error(
                          result?.error || "Invalid response from server"
                        );
                      }
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Failed to upload logo";
                      toast.error(errorMessage);
                      setLogoFile(undefined);
                      form.setFieldValue("companyLogo", {
                        url: "",
                        publicId: "",
                      });
                    } finally {
                      setIsUploadingLogo(false);
                    }
                  };

                  const hasLogo =
                    logoValue?.url &&
                    logoValue.url !== undefined &&
                    (logoValue.url.startsWith("data:") ||
                      logoValue.url.startsWith("http"));

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Company Logo</FieldLabel>
                      {hasLogo && (
                        <div className="mb-4">
                          <Image
                            src={logoValue.url}
                            alt="Company Logo"
                            className="h-24 w-24 rounded-md object-cover border"
                            width={96}
                            height={96}
                            priority
                          />
                        </div>
                      )}
                      <Dropzone
                        accept={{
                          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                        }}
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024} // 5MB
                        minSize={1024}
                        disabled={isUploadingLogo}
                        onDrop={(files) => {
                          if (files.length > 0) {
                            handleFileUpload(files[0]);
                          }
                        }}
                        onError={(error) => {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Failed to upload file"
                          );
                        }}
                        src={logoFile ? [logoFile] : undefined}
                      >
                        <DropzoneEmptyState />
                        <DropzoneContent
                          onRemove={() => {
                            setLogoFile(undefined);
                            form.setFieldValue("companyLogo", {
                              url: "",
                              publicId: undefined,
                            });
                          }}
                        />
                      </Dropzone>
                      <FieldDescription>
                        {isUploadingLogo
                          ? "Uploading logo..."
                          : "Upload a company logo image (PNG, JPG, GIF, or WEBP)"}
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="aboutCompany">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        About Company
                      </FieldLabel>
                      <MinimalTiptap
                        content={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <form.Field name="companySize">
                  {(field) => {
                    const isInvalid =
                      (field.state.meta.isTouched || form.state.isSubmitted) &&
                      !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Company Size
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., 50-100 employees"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="companyWebsite">
                  {(field) => {
                    const isInvalid =
                      (field.state.meta.isTouched || form.state.isSubmitted) &&
                      !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Company Website
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="https://www.company.com"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Essential details about the job position
                </p>
              </div>

              <form.Field name="title">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
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
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="about">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Job Description
                      </FieldLabel>
                      <MinimalTiptap
                        content={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            {/* Job Details Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold">Job Details</h2>
                <p className="text-sm text-muted-foreground">
                  Specific requirements and preferences
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <form.Field name="department">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Department</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_OPENING_DEPARTMENTS.map((department) => (
                              <SelectItem
                                key={department.value}
                                value={department.value}
                              >
                                {department.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="location">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Location</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value as JobOpeningLocation)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_OPENING_LOCATIONS.map((location) => (
                              <SelectItem
                                key={location.value}
                                value={location.value as JobOpeningLocation}
                              >
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="jobType">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Job Type</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value as JobType)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_TYPE_OPTIONS.map((jobType) => (
                              <SelectItem
                                key={jobType.value}
                                value={jobType.value}
                              >
                                {jobType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="experienceLevel">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Experience Level</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_OPENING_EXPERIENCE_LEVELS.map(
                              (experienceLevel) => (
                                <SelectItem
                                  key={experienceLevel.value}
                                  value={experienceLevel.value}
                                >
                                  {experienceLevel.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>

              <form.Field name="requiredSkills">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  const selectedTagsMap = new Map<
                    string,
                    { id: string; label: string }
                  >();
                  (field.state.value || []).forEach((skill) => {
                    const found = JOB_OPENING_REQUIRED_SKILLS.find(
                      (tag) => tag.label.toUpperCase() === skill.toUpperCase()
                    );
                    const tag = found || {
                      id: skill.toLowerCase(),
                      label: skill,
                    };
                    if (!selectedTagsMap.has(tag.id)) {
                      selectedTagsMap.set(tag.id, tag);
                    }
                  });
                  const selectedTags = Array.from(selectedTagsMap.values());

                  const handleChange = (
                    tags: Array<{ id: string; label: string }>
                  ) => {
                    const skills = tags.map((tag) => tag.label);
                    field.handleChange(skills);
                  };

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Required Skills</FieldLabel>
                      <TagsSelector
                        tags={JOB_OPENING_REQUIRED_SKILLS}
                        value={selectedTags}
                        onChange={handleChange}
                        placeholder="Select required skills..."
                        createText="Create"
                      />
                      <FieldDescription>
                        Select or create the required skills for this position
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="filteringDescription">
                {(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Filtering Description
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter additional description used for filtering and matching candidates..."
                        rows={6}
                      />
                      <FieldDescription>
                        Additional description used for filtering and matching
                        candidates
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold">Compensation</h2>
                <p className="text-sm text-muted-foreground">
                  Salary range and currency information
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <form.Field name="currency">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Currency</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => {
                            field.handleChange(value as CurrencyEnum);

                            if (CURRENCY_SYMBOLS[value as CurrencyEnum]) {
                              form.setFieldValue(
                                "currencySymbol",
                                CURRENCY_SYMBOLS[value as CurrencyEnum]
                              );
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map((currency) => (
                              <SelectItem
                                key={currency.value}
                                value={currency.value}
                              >
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="salaryRange.min">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const currencySymbol =
                      form.state.values.currencySymbol || "$";

                    const currentValue = field.state.value ?? "0";
                    const displayValue =
                      currentValue && currentValue !== "0"
                        ? currentValue.match(/[KM]$/i)
                          ? currentValue
                          : formatSalary(currentValue)
                        : "";

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Minimum Salary</FieldLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            type="text"
                            value={displayValue ?? ""}
                            onBlur={(e) => {
                              const parsed = parseSalary(e.target.value);
                              field.handleChange(parsed || "0");
                              field.handleBlur();
                            }}
                            onChange={(e) => {
                              field.handleChange(e.target.value || "0");
                            }}
                            placeholder="e.g., 50K or 1.5M"
                            className="pl-7"
                          />
                        </div>
                        <FieldDescription>
                          Enter amount with K (thousands) or M (millions), e.g.,
                          100K or 1.5M
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="salaryRange.max">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const currencySymbol =
                      form.state.values.currencySymbol || "$";

                    const currentValue = field.state.value ?? "0";
                    const displayValue =
                      currentValue && currentValue !== "0"
                        ? currentValue.match(/[KM]$/i)
                          ? currentValue
                          : formatSalary(currentValue)
                        : "";

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Maximum Salary</FieldLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            type="text"
                            value={displayValue ?? ""}
                            onBlur={(e) => {
                              const parsed = parseSalary(e.target.value);
                              field.handleChange(parsed || "0");
                              field.handleBlur();
                            }}
                            onChange={(e) => {
                              field.handleChange(e.target.value || "0");
                            }}
                            placeholder="e.g., 150K or 2M"
                            className="pl-7"
                          />
                        </div>
                        <FieldDescription>
                          Enter amount with K (thousands) or M (millions), e.g.,
                          100K or 1.5M
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={createJobOpeningMutation.isPending}
              >
                <RefreshCcwIcon className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={createJobOpeningMutation.isPending}
              >
                {createJobOpeningMutation.isPending
                  ? "Creating..."
                  : "Create Job Opening"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
};

"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { htmlToText } from "html-to-text";
import {
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  TrendingUp,
  Globe,
  Users,
  Calendar,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JobOpening } from "@/lib/generated/prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const convertHtmlToText = (html: string) => {
  try {
    return htmlToText(html, {
      wordwrap: false,
      preserveNewlines: false,
    });
  } catch {
    return html;
  }
};

const formatSalaryValue = (value: string): string => {
  if (!value || value === "0") return "";

  const upperValue = value.trim().toUpperCase();
  if (upperValue.endsWith("K") || upperValue.endsWith("M")) {
    return upperValue;
  }

  const num = Number.parseFloat(value);
  if (Number.isNaN(num) || num === 0) return "";

  const formatted =
    num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();
  return formatted.replace(".0", "");
};

const formatSalary = (
  salaryRange: { min: string; max?: string } | null | undefined,
  currencySymbol: string = "$"
): string | null => {
  if (!salaryRange) return null;

  const formattedMin = formatSalaryValue(salaryRange.min);
  const formattedMax = salaryRange.max
    ? formatSalaryValue(salaryRange.max)
    : null;

  if (!formattedMin && !formattedMax) return null;
  if (!formattedMin) return `Up to ${currencySymbol}${formattedMax}`;
  if (!formattedMax) return `${currencySymbol}${formattedMin}+`;

  return `${currencySymbol}${formattedMin} - ${currencySymbol}${formattedMax}`;
};

const getCompanyLogoUrl = (
  companyLogo: string | null | undefined
): string | null => {
  try {
    if (!companyLogo) return null;
    const parsed =
      typeof companyLogo === "string" ? JSON.parse(companyLogo) : companyLogo;
    return parsed?.url || null;
  } catch {
    return null;
  }
};

const getLocationLabel = (location: string): string => {
  const locationMap: Record<string, string> = {
    REMOTE: "Remote",
    OFFICE: "On-site",
    HYBRID: "Hybrid",
  };
  return locationMap[location] || location;
};

const getJobTypeLabel = (jobType: string): string => {
  const typeMap: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    TEMPORARY: "Temporary",
  };
  return typeMap[jobType] || jobType;
};

export const JobsViewById = ({ jobId }: { jobId: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.jobs.getJobOpening.queryOptions({ jobOpeningId: jobId })
  );
  const [isApplying, setIsApplying] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold text-foreground">
            Job not found
          </h3>
          <p className="text-muted-foreground">
            The job opening you're looking for doesn't exist or has been
            removed.
          </p>
          <Button asChild variant="outline">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const job = data as unknown as JobOpening;
  const {
    title,
    about,
    companyName,
    companyLogo,
    companyWebsite,
    companySize,
    companyAddress,
    aboutCompany,
    department,
    location,
    experienceLevel,
    requiredSkills,
    salaryRange,
    currencySymbol,
    jobType,
    createdAt,
  } = job;

  const logoUrl = getCompanyLogoUrl(companyLogo);
  const formattedSalary = formatSalary(
    salaryRange as { min: string; max?: string } | null | undefined,
    currencySymbol || "$"
  );
  const skills = Array.isArray(requiredSkills)
    ? requiredSkills
    : typeof requiredSkills === "string"
      ? JSON.parse(requiredSkills || "[]")
      : [];

  const handleApply = async () => {
    setIsApplying(true);
    if (!session) {
      toast.error("You must be logged in to apply for a job");
      router.push("/sign-in");
      return;
    }
    setTimeout(() => {
      setIsApplying(false);
      router.push(`/jobs/${jobId}/resume`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/jobs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                {logoUrl ? (
                  <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-background border-2 border-border shadow-md">
                    <Image
                      src={logoUrl}
                      alt={companyName || "Company logo"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-border flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary/70" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-base">
                      {companyName && (
                        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span>{companyName}</span>
                        </div>
                      )}
                      {companySize && (
                        <>
                          {companyName && (
                            <span className="text-muted-foreground/40">•</span>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <span>{companySize}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/5 border-primary/20 text-primary"
                    >
                      {getJobTypeLabel(jobType)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-sm font-semibold px-3 py-1.5 rounded-full bg-background"
                    >
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {getLocationLabel(location)}
                    </Badge>
                    {formattedSalary && (
                      <Badge
                        variant="outline"
                        className="text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/5 border-primary/20 text-primary"
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                        {formattedSalary}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-foreground">
                Job Description
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {convertHtmlToText(about)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          {aboutCompany && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-foreground">
                  About the Company
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {convertHtmlToText(aboutCompany)}
                </p>
                {companyAddress && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{companyAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {skills && skills.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Required Skills
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-sm font-medium px-3 py-1.5 rounded-md bg-background border-border/50"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="sticky top-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/0">
            <CardHeader>
              <h3 className="text-xl font-bold text-foreground">
                Apply for this position
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleApply}
                disabled={isApplying}
                size="lg"
                className="w-full font-semibold text-base h-12"
              >
                {isApplying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Apply Now
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                By applying, you agree to share your resume and profile
                information
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold text-foreground">Job Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">
                      Department
                    </div>
                    <div className="text-muted-foreground">{department}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">
                      Experience Level
                    </div>
                    <div className="text-muted-foreground">
                      {experienceLevel}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Posted</div>
                    <div className="text-muted-foreground">
                      {createdAt
                        ? formatDistanceToNow(new Date(createdAt), {
                            addSuffix: true,
                          })
                        : "Recently"}
                    </div>
                  </div>
                </div>

                {companyWebsite && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">
                          Website
                        </div>
                        <a
                          href={companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit Company Website
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const JobsViewByIdLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-2xl font-semibold text-foreground">
          Loading job details...
        </h3>
      </div>
    </div>
  );
};

export const JobsViewByIdError = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-foreground">
          Error loading job
        </h3>
        <p className="text-muted-foreground">
          Something went wrong while loading the job details. Please try again.
        </p>
        <Button asChild variant="outline">
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    </div>
  );
};

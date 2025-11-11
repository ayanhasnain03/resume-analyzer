"use client";

import { formatDistanceToNow } from "date-fns";
import { htmlToText } from "html-to-text";
import numeral from "numeral";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  ExternalLink,
  Globe,
  Users,
} from "lucide-react";
import Image from "next/image";
import { JobOpening } from "@/lib/generated/prisma/client";
import Link from "next/link";

interface JobCardProps {
  job: JobOpening & {
    _count?: {
      JobApplicants: number;
    };
  };
}

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

  // Check if value already has k/m notation
  const upperValue = value.trim().toUpperCase();
  if (upperValue.endsWith("K") || upperValue.endsWith("M")) {
    return upperValue;
  }

  // Convert number to k/m notation
  const num = Number.parseFloat(value);
  if (Number.isNaN(num) || num === 0) return "";

  const formatted = numeral(num).format("0.0a").toUpperCase();
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

export const JobCard = ({ job }: JobCardProps) => {
  const {
    id,
    title,
    about,
    companyName,
    companyLogo,
    companyWebsite,
    companySize,
    department,
    location,
    experienceLevel,
    requiredSkills,
    salaryRange,
    currencySymbol,
    jobType,
    createdAt,
    _count,
  } = job;

  const truncatedAbout =
    about.length > 120 ? `${about.substring(0, 120)}...` : about;

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

  const applicantCount = _count?.JobApplicants || 0;

  return (
    <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border border-border/60 bg-background">
      {/* Subtle hover accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-4 pt-6 px-6 relative z-10">
        <div className="flex items-start gap-4 mb-4">
          {logoUrl ? (
            <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-background border-2 border-border shadow-md group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
              <Image
                src={logoUrl}
                alt={companyName || "Company logo"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-border flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
              <Building2 className="h-8 w-8 text-primary/70" />
            </div>
          )}

          {/* Title and Company Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <CardTitle className="text-xl font-bold line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {companyName && (
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{companyName}</span>
                </div>
              )}
              {companySize && (
                <>
                  {companyName && (
                    <span className="text-muted-foreground/40">•</span>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{companySize}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Job Type and Location Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/5 border-primary/20 text-primary"
          >
            {getJobTypeLabel(jobType)}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-semibold px-3 py-1 rounded-full bg-background"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {getLocationLabel(location)}
          </Badge>
          {applicantCount > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-3 py-1 rounded-full bg-muted/50"
            >
              <Users className="h-3 w-3 mr-1" />
              {applicantCount}{" "}
              {applicantCount === 1 ? "applicant" : "applicants"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-5 px-6 relative z-10">
        {/* Description */}
        <CardDescription className="text-sm leading-relaxed line-clamp-3 text-muted-foreground">
          {convertHtmlToText(truncatedAbout)}
        </CardDescription>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:bg-muted/70 transition-colors">
            <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">
              {department}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:bg-muted/70 transition-colors">
            <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">
              {experienceLevel}
            </span>
          </div>

          {formattedSalary && (
            <div className="col-span-2 flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 group-hover:bg-primary/10 transition-colors">
              <DollarSign className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-semibold text-primary">
                {formattedSalary}
              </span>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 5).map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-medium px-2.5 py-1 rounded-md bg-background border-border/50"
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted/50"
                >
                  +{skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t border-border/50 bg-muted/20 pt-4 pb-5 px-6 mt-auto relative z-10">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              {createdAt
                ? formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })
                : "Recently"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {companyWebsite && (
              <Button variant="ghost" size="sm" className="h-8 px-3" asChild>
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  Website
                </a>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              className="h-8 px-4 font-semibold"
              asChild
            >
              <Link href={`/jobs/${id}`}>
                View Details
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

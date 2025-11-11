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
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  EllipsisVertical,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardJobCardProps {
  id: string;
  title: string;
  description: string;
  companyLogo: string;
  companyName: string;
  companyAddress: string;
  salaryRange: {
    min: string;
    max: string;
  };
  companySize: string;
  department: string;
  location: string;
  experienceLevel: string;
  status: string;
  requiredSkills: string[];
  totalApplicants?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onInterviewManagement?: () => void;
  createdAt?: Date;
  updatedAt?: Date;
}

const convertHtmlToText = (html: string) => {
  return htmlToText(html);
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const statusLower = status.toLowerCase();
  if (statusLower === "active" || statusLower === "open") return "default";
  if (statusLower === "closed" || statusLower === "filled") return "secondary";
  if (statusLower === "draft") return "outline";
  return "default";
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

const formatSalary = (min: string, max: string): string | null => {
  const formattedMin = formatSalaryValue(min);
  const formattedMax = formatSalaryValue(max);

  if (!formattedMin && !formattedMax) return null;
  if (!formattedMin) return `Up to $${formattedMax}`;
  if (!formattedMax) return `$${formattedMin}+`;

  return `$${formattedMin} - $${formattedMax}`;
};

const getCompanyLogoUrl = (companyLogo: string): string | null => {
  try {
    if (!companyLogo) return null;
    const parsed = JSON.parse(companyLogo);
    return parsed?.url || null;
  } catch {
    return null;
  }
};

export const DashboardJobCard = ({
  id,
  title,
  description,
  department,
  location,
  experienceLevel,
  status,
  requiredSkills,
  totalApplicants,
  onEdit,
  onDelete,
  createdAt,
  companyLogo,
  companyName,
  companyAddress: _companyAddress,
  salaryRange,
  companySize,
  onInterviewManagement,
}: DashboardJobCardProps) => {
  const truncatedDescription =
    description.length > 150
      ? `${description.substring(0, 150)}...`
      : description;

  const logoUrl = getCompanyLogoUrl(companyLogo);
  const formattedSalary = formatSalary(salaryRange.min, salaryRange.max);

  return (
    <Card
      key={id}
      className="group relative flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border border-border/60 bg-background"
    >
      {/* Subtle hover accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <CardHeader className="pb-4 pt-5 px-5 relative z-10">
        <div className="flex items-start gap-3.5 mb-3.5">
          {logoUrl ? (
            <div className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-background border border-border shadow-sm group-hover:border-primary/40 transition-all duration-200">
              <Image
                src={logoUrl}
                alt={companyName || "Company logo"}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="shrink-0 w-14 h-14 rounded-lg bg-muted/50 border border-border flex items-center justify-center group-hover:border-primary/40 transition-all duration-200">
              <Building2 className="h-6 w-6 text-muted-foreground/70" />
            </div>
          )}

          {/* Title and Company Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 leading-snug text-foreground">
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {companyName && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{companyName}</span>
                </div>
              )}
              {companySize && (
                <>
                  {companyName && (
                    <span className="text-muted-foreground/40">•</span>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">{companySize}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        .{/* Status and Applicants Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={getStatusVariant(status)}
            className={cn(
              "text-xs font-medium capitalize px-3 py-1 rounded-md",
              status.toLowerCase() === "active" &&
                "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
              status.toLowerCase() === "open" &&
                "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
              status.toLowerCase() === "draft" &&
                "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
              status.toLowerCase() === "closed" &&
                "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
            )}
          >
            {status}
          </Badge>
          {totalApplicants !== undefined && totalApplicants > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-3 py-1 rounded-md bg-background"
            >
              <Users className="h-3 w-3 mr-1.5" />
              {totalApplicants}{" "}
              {totalApplicants !== 1 ? "applicants" : "applicant"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-5 px-5 relative z-10">
        {/* Description */}
        <CardDescription className="text-sm leading-relaxed line-clamp-3 text-muted-foreground">
          {convertHtmlToText(truncatedDescription)}
        </CardDescription>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted/50 border border-border/50">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">
              {department}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted/50 border border-border/50">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">
              {location}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted/50 border border-border/50">
            <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">
              {experienceLevel}
            </span>
          </div>

          {formattedSalary && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
              <DollarSign className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-semibold text-primary">
                {formattedSalary}
              </span>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {requiredSkills && requiredSkills.length > 0 && (
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.slice(0, 6).map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-background"
                >
                  {skill}
                </Badge>
              ))}
              {requiredSkills.length > 6 && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-muted/50"
                >
                  +{requiredSkills.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t border-border bg-muted/30 pt-4 pb-4 px-5 mt-auto relative z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              {createdAt
                ? formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })
                : "N/A"}
            </span>
          </div>
          {totalApplicants !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-md text-xs",
                totalApplicants > 0
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground bg-muted/50 border border-border/50"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{totalApplicants}</span>
            </div>
          )}
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
              <DropdownMenuItem onClick={onInterviewManagement}>
                Interview Management
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardFooter>
    </Card>
  );
};

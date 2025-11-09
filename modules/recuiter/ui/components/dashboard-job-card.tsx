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
  Calendar,
  Edit,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  companySize: _companySize,
}: DashboardJobCardProps) => {
  const truncatedDescription =
    description.length > 150
      ? `${description.substring(0, 150)}...`
      : description;

  const logoUrl = getCompanyLogoUrl(companyLogo);
  const formattedSalary = formatSalary(salaryRange.min, salaryRange.max);
  console.log(createdAt);
  return (
    <Card
      key={id}
      className="group relative flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 border border-border/40 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-1 pt-5 px-5 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {logoUrl ? (
              <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-background border border-border/60 shadow-sm group-hover:shadow-lg group-hover:border-primary/30 group-hover:scale-105 transition-all duration-300">
                <Image
                  src={logoUrl}
                  alt={companyName || "Company logo"}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            ) : (
              <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <Building2 className="h-7 w-7 text-primary/70 group-hover:text-primary transition-colors duration-300" />
              </div>
            )}

            {/* Title and Company Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                {title}
              </CardTitle>
              {companyName && (
                <p className="text-sm text-muted-foreground/80 truncate flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{companyName}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status and Applicants Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={getStatusVariant(status)}
            className={cn(
              "text-xs font-semibold capitalize px-3 py-1 rounded-full shadow-sm transition-all duration-300",
              status.toLowerCase() === "active" &&
                "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 group-hover:shadow-emerald-500/20",
              status.toLowerCase() === "open" &&
                "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 group-hover:shadow-blue-500/20"
            )}
          >
            <Sparkles className="h-3 w-3 mr-1 inline-block" />
            {status}
          </Badge>
          {totalApplicants !== undefined && totalApplicants > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-semibold px-3 py-1 rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors duration-300 shadow-sm"
            >
              <Users className="h-3 w-3 mr-1.5" />
              {totalApplicants}{" "}
              {totalApplicants !== 1 ? "applicants" : "applicant"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5 pb-5 px-5 relative z-10">
        {/* Description with better styling */}
        <CardDescription className="text-sm leading-relaxed line-clamp-3 text-muted-foreground/90">
          {convertHtmlToText(truncatedDescription)}
        </CardDescription>

        {/* Job Details Grid - More compact and modern */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group/item flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
            <Building2 className="h-4 w-4 shrink-0 text-primary/60 group-hover/item:text-primary group-hover/item:scale-110 transition-all duration-200" />
            <span className="truncate font-medium text-foreground/90">
              {department}
            </span>
          </div>

          <div className="group/item flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
            <MapPin className="h-4 w-4 shrink-0 text-primary/60 group-hover/item:text-primary group-hover/item:scale-110 transition-all duration-200" />
            <span className="truncate text-foreground/90">{location}</span>
          </div>

          <div className="group/item flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
            <Briefcase className="h-4 w-4 shrink-0 text-primary/60 group-hover/item:text-primary group-hover/item:scale-110 transition-all duration-200" />
            <span className="truncate text-foreground/90">
              {experienceLevel}
            </span>
          </div>

          {formattedSalary && (
            <div className="group/item flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border border-primary/20 transition-all duration-200">
              <DollarSign className="h-4 w-4 shrink-0 text-primary group-hover/item:scale-110 transition-all duration-200" />
              <span className="truncate font-bold text-primary">
                {formattedSalary}
              </span>
            </div>
          )}
        </div>

        {/* Skills Section with enhanced design */}
        {requiredSkills && requiredSkills.length > 0 && (
          <div className="pt-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-primary/60" />
              <span>Key Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.slice(0, 5).map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-medium px-3 py-1 rounded-full hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:scale-105 hover:shadow-sm transition-all duration-200 cursor-default"
                >
                  {skill}
                </Badge>
              ))}
              {requiredSkills.length > 5 && (
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-muted/50 border-dashed hover:bg-muted transition-colors duration-200"
                >
                  +{requiredSkills.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer with glassmorphism effect */}
      <CardFooter className="border-t border-border/50 bg-muted/20 backdrop-blur-sm pt-4 pb-4 px-5 mt-auto relative z-10">
        <div className="flex items-center justify-between w-full text-xs">
          <div className="flex items-center gap-2 text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-300">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              {createdAt
                ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                : "N/A"}
            </span>
          </div>
          {totalApplicants !== undefined && (
            <div
              className={cn(
                "flex items-center gap-2 font-bold px-3 py-1.5 rounded-full transition-all duration-300",
                totalApplicants > 0
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground/70 bg-muted/30"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{totalApplicants}</span>
            </div>
          )}
        </div>
        <CardAction>
          <div className="flex gap-1.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Edit job"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-9 w-9 rounded-lg text-destructive/70 hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Delete job"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardAction>
      </CardFooter>
    </Card>
  );
};

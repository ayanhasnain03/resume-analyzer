import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DashboardInterviewScheduleForm } from "./dashboard-interview-schedule-form";

interface DashboardInterviewManageScheduleModalProps {
  jobOpeningId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DashboardInterviewManageScheduleModal = ({
  jobOpeningId,
  open,
  onOpenChange,
}: DashboardInterviewManageScheduleModalProps) => {
  return (
    <ResponsiveDialog
      title="Generate Interview Questions"
      description="Generate interview questions for the job opening"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DashboardInterviewScheduleForm
        jobOpeningId={jobOpeningId}
        onOpenChange={onOpenChange}
      />
    </ResponsiveDialog>
  );
};

import { cn } from "@/lib/utils";
import type {
  RentStatus,
  OccupancyStatus,
  PaymentApprovalStatus,
  MaintenanceStatus,
} from "@/types";
import { semanticTone } from "@/lib/color-system";

type Status = RentStatus | OccupancyStatus | PaymentApprovalStatus | MaintenanceStatus;

const statusStyles: Record<string, string> = {
  Paid: semanticTone.success.badge,
  Approved: semanticTone.success.badge,
  Occupied: semanticTone.success.badge,
  Resolved: semanticTone.success.badge,
  Pending: semanticTone.pending.badge,
  Open: semanticTone.pending.badge,
  Overdue: semanticTone.danger.badge,
  Rejected: semanticTone.danger.badge,
  "In Progress": semanticTone.scheduled.badge,
  Maintenance: semanticTone.maintenance.badge,
  Vacant: semanticTone.neutral.badge,
};

interface Props {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status] ?? semanticTone.neutral.badge,
        className
      )}
    >
      {status}
    </span>
  );
}

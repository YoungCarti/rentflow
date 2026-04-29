import { cn } from "@/lib/utils";
import type {
  RentStatus,
  OccupancyStatus,
  PaymentApprovalStatus,
  MaintenanceStatus,
} from "@/types";

type Status = RentStatus | OccupancyStatus | PaymentApprovalStatus | MaintenanceStatus;

const statusStyles: Record<string, string> = {
  Paid:        "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-400/40",
  Approved:    "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-400/40",
  Occupied:    "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-400/40",
  Pending:     "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-300/40",
  Overdue:     "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/22 dark:text-red-100 dark:border-red-300/45",
  Rejected:    "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/22 dark:text-red-100 dark:border-red-300/45",
  Vacant:      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/22 dark:text-slate-100 dark:border-slate-300/35",
  Maintenance: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/22 dark:text-orange-100 dark:border-orange-300/40",
  Open:        "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/22 dark:text-red-100 dark:border-red-300/45",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/22 dark:text-blue-100 dark:border-blue-300/45",
  Resolved:    "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-400/40",
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
        statusStyles[status] ?? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/22 dark:text-slate-100 dark:border-slate-300/35",
        className
      )}
    >
      {status}
    </span>
  );
}

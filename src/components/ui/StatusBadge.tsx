import { cn } from "@/lib/utils";
import type { RentStatus, OccupancyStatus, PaymentApprovalStatus } from "@/types";

type Status = RentStatus | OccupancyStatus | PaymentApprovalStatus;

const statusStyles: Record<string, string> = {
  Paid:        "bg-green-100 text-green-700 border-green-200",
  Approved:    "bg-green-100 text-green-700 border-green-200",
  Occupied:    "bg-green-100 text-green-700 border-green-200",
  Pending:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  Overdue:     "bg-red-100   text-red-700   border-red-200",
  Rejected:    "bg-red-100   text-red-700   border-red-200",
  Vacant:      "bg-slate-100 text-slate-600  border-slate-200",
  Maintenance: "bg-orange-100 text-orange-700 border-orange-200",
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
        statusStyles[status] ?? "bg-slate-100 text-slate-600 border-slate-200",
        className
      )}
    >
      {status}
    </span>
  );
}

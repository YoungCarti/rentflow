import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  summary: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  summary,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{summary}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertCircle, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveRentRecords, getRentReminders } from "@/lib/rent-reminders";
import RentReminderCenter from "@/components/rent/RentReminderCenter";
import RentTable from "@/components/rent/RentTable";
import type { RentRecord } from "@/types";

type WorkspaceView = "attention" | "records";

export default function RentTrackingWorkspace({
  records,
}: {
  records: RentRecord[];
}) {
  const [activeView, setActiveView] = useState<WorkspaceView>("attention");
  const activeRecords = getActiveRentRecords(records);
  const reminderCount = getRentReminders(activeRecords).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Rent Workbench</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow-ups and records for this month.
          </p>
        </div>
        <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          <Button
            type="button"
            variant={activeView === "attention" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-1.5",
              activeView !== "attention" && "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveView("attention")}
          >
            <AlertCircle className="h-4 w-4" />
            Needs Attention
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                activeView === "attention"
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {reminderCount}
            </span>
          </Button>
          <Button
            type="button"
            variant={activeView === "records" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-1.5",
              activeView !== "records" && "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveView("records")}
          >
            <Table2 className="h-4 w-4" />
            Rent Records
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                activeView === "records"
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {records.length}
            </span>
          </Button>
        </div>
      </div>

      {activeView === "attention" ? (
        <RentReminderCenter records={activeRecords} />
      ) : (
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Rent Records</h2>
            <p className="text-xs text-muted-foreground">
              Current and historical rent records by tenant
            </p>
          </div>
          <div className="border-t border-border pt-3">
            <RentTable records={records} />
          </div>
        </section>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import CopyReminderMessageButton from "@/components/payments/CopyReminderMessageButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatReminderDate,
  formatRM,
  getRentReminders,
  type RentReminderTiming,
} from "@/lib/rent-reminders";
import { semanticTone } from "@/lib/color-system";
import type { RentRecord } from "@/types";

function timingStyles(timing: RentReminderTiming) {
  return {
    "Before Due": {
      icon: CalendarClock,
      label: "Before due",
      className: semanticTone.pending.soft,
    },
    "Due Today": {
      icon: Clock,
      label: "Due today",
      className: semanticTone.pending.soft,
    },
    Overdue: {
      icon: AlertCircle,
      label: "Overdue",
      className: semanticTone.danger.soft,
    },
  }[timing];
}

function duePhrase(timing: RentReminderTiming, daysFromDue: number) {
  if (timing === "Due Today") {
    return "Due today";
  }

  if (timing === "Before Due") {
    return `Due in ${daysFromDue} day${daysFromDue === 1 ? "" : "s"}`;
  }

  const daysOverdue = Math.abs(daysFromDue);
  return `${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue`;
}

export default function RentReminderCenter({ records }: { records: RentRecord[] }) {
  const [showAll, setShowAll] = useState(false);
  const reminders = getRentReminders(records);
  const counts = reminders.reduce<Record<RentReminderTiming, number>>(
    (acc, reminder) => {
      acc[reminder.timing] += 1;
      return acc;
    },
    { "Before Due": 0, "Due Today": 0, Overdue: 0 }
  );
  const visibleReminders = showAll ? reminders : reminders.slice(0, 5);
  const hiddenCount = Math.max(reminders.length - visibleReminders.length, 0);
  const nextStep =
    counts.Overdue > 0
      ? `${counts.Overdue} tenants are overdue. Start by sending reminders to the oldest unpaid records.`
      : counts["Due Today"] > 0
        ? `${counts["Due Today"]} tenants have rent due today. Send quick reminders before the day ends.`
        : counts["Before Due"] > 0
          ? `${counts["Before Due"]} upcoming rent payments may need a friendly reminder.`
          : "No tenant needs a reminder right now.";

  return (
    <section className="rounded-lg border border-border bg-card/40">
      <div className="border-b border-border p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold text-foreground">Needs Attention</h2>
            <p className="mt-1 text-sm text-muted-foreground">{nextStep}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Overdue", "Due Today", "Before Due"] as RentReminderTiming[]).map((timing) => {
              const style = timingStyles(timing);
              const Icon = style.icon;

              return (
                <span
                  key={timing}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                    style.className
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {style.label}: {counts[timing]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        {reminders.length === 0 ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <CheckCircle2 className={`h-4 w-4 ${semanticTone.success.textSoft}`} />
            No rent reminders needed right now.
          </div>
        ) : (
          visibleReminders.map(({ record, timing, daysFromDue }) => {
            const style = timingStyles(timing);

            return (
              <div
                key={record.id}
                className={cn(
                  "grid gap-3 border-b border-border p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
                  timing === "Overdue" && "border-l-2 border-l-red-500 bg-red-500/[0.04]"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {record.tenantName}
                    </p>
                    <StatusBadge status={record.status} />
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                        style.className
                      )}
                    >
                      {duePhrase(timing, daysFromDue)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {record.propertyName} · Unit {record.unitNumber} ·{" "}
                    {record.month} · {formatRM(record.amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {formatReminderDate(record.dueDate)}
                    {record.tenantEmail ? ` · ${record.tenantEmail}` : ""}
                    {record.tenantPhone ? ` · ${record.tenantPhone}` : ""}
                  </p>
                </div>

                <div className="shrink-0">
                  <CopyReminderMessageButton
                    tenantName={record.tenantName}
                    tenantPhone={record.tenantPhone}
                    tenantEmail={record.tenantEmail}
                    month={record.month}
                    amount={record.amount}
                    dueDate={record.dueDate}
                    paymentLinkId={record.paymentLinkId}
                    status={record.status}
                    timing={timing}
                    mode="primary"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      {reminders.length > 5 && (
        <div className="border-t border-border p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View all {hiddenCount} more
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}

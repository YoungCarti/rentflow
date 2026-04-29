"use client";

import { AlertCircle, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import CopyReminderMessageButton from "@/components/payments/CopyReminderMessageButton";
import { cn } from "@/lib/utils";
import {
  formatReminderDate,
  formatRM,
  getRentReminders,
  type RentReminderTiming,
} from "@/lib/rent-reminders";
import type { RentRecord } from "@/types";

function timingStyles(timing: RentReminderTiming) {
  return {
    "Before Due": {
      icon: CalendarClock,
      label: "Before due",
      className: "bg-blue-50 text-blue-700 border-blue-100",
    },
    "Due Today": {
      icon: Clock,
      label: "Due today",
      className: "bg-amber-50 text-amber-700 border-amber-100",
    },
    Overdue: {
      icon: AlertCircle,
      label: "Overdue",
      className: "bg-red-50 text-red-700 border-red-100",
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
  const reminders = getRentReminders(records);
  const counts = reminders.reduce<Record<RentReminderTiming, number>>(
    (acc, reminder) => {
      acc[reminder.timing] += 1;
      return acc;
    },
    { "Before Due": 0, "Due Today": 0, Overdue: 0 }
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Automated Rent Reminders
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              WhatsApp and email messages generated from due dates and payment links
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Before Due", "Due Today", "Overdue"] as RentReminderTiming[]).map(
              (timing) => {
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
              }
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            No rent reminders needed right now.
          </div>
        ) : (
          reminders.map(({ record, timing, daysFromDue }) => {
            const style = timingStyles(timing);

            return (
              <div
                key={record.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
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
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

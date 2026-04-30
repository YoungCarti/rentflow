"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { semanticTone } from "@/lib/color-system";
import { cn } from "@/lib/utils";
import type { CalendarEvent, CalendarEventType } from "@/lib/calendar";

type ViewMode = "month" | "list";
type CalendarGroup = "payments" | "maintenance" | "leases" | "inspections";

const groupStyles: Record<
  CalendarGroup,
  { label: string; icon: typeof Banknote; className: string; soft: string; dot: string }
> = {
  payments: {
    label: "Payments",
    icon: Banknote,
    className: `${semanticTone.pending.bg} ${semanticTone.pending.text} ${semanticTone.pending.border}`,
    soft: semanticTone.pending.soft,
    dot: semanticTone.pending.bgStrong,
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    className: `${semanticTone.maintenance.bg} ${semanticTone.maintenance.text} ${semanticTone.maintenance.border}`,
    soft: semanticTone.maintenance.soft,
    dot: semanticTone.maintenance.bgStrong,
  },
  leases: {
    label: "Leases",
    icon: AlertCircle,
    className: `${semanticTone.pending.bg} ${semanticTone.pending.text} ${semanticTone.pending.border}`,
    soft: semanticTone.pending.soft,
    dot: semanticTone.pending.bgStrong,
  },
  inspections: {
    label: "Inspections",
    icon: CalendarCheck,
    className: `${semanticTone.scheduled.bg} ${semanticTone.scheduled.text} ${semanticTone.scheduled.border}`,
    soft: semanticTone.scheduled.soft,
    dot: semanticTone.scheduled.bgStrong,
  },
};

const eventLabels: Record<CalendarEventType, string> = {
  rent_due: "Payment",
  maintenance: "Maintenance",
  lease_expiry: "Lease expiry",
  inspection: "Inspection",
};

function eventGroup(type: CalendarEventType): CalendarGroup {
  if (type === "rent_due") return "payments";
  if (type === "maintenance") return "maintenance";
  if (type === "inspection") return "inspections";
  return "leases";
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function calendarDays(monthStart: Date) {
  const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dayLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-MY", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function EventPill({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const group = eventGroup(event.type);
  const style = groupStyles[group];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "min-w-0 rounded-md border-l-4 bg-card px-2.5 py-2 text-xs shadow-xs",
        group === "payments" && "border-l-amber-500",
        group === "maintenance" && "border-l-violet-500",
        group === "leases" && "border-l-amber-500",
        group === "inspections" && "border-l-blue-500",
        compact ? "space-y-0.5" : "space-y-1.5"
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", style.dot.replace("bg-", "text-"))} />
        <span className="truncate font-semibold text-foreground">{event.title}</span>
      </div>
      {!compact && (
        <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
          {event.amount ? `${formatRM(event.amount)} · ` : ""}
          {event.description}
        </p>
      )}
    </div>
  );
}

function AgendaItem({ event }: { event: CalendarEvent }) {
  const group = eventGroup(event.type);
  const style = groupStyles[group];
  const Icon = style.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", style.soft)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">{formatDate(event.date)}</p>
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", style.soft)}>
              {eventLabels[event.type]}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">{event.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {event.amount ? `${formatRM(event.amount)} · ` : ""}
            {event.description}
          </p>
          {event.status && (
            <div className="mt-2">
              <StatusBadge status={event.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalendarView({
  events,
  selectedMonth,
}: {
  events: CalendarEvent[];
  selectedMonth: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const monthStart = useMemo(() => parseMonthKey(selectedMonth), [selectedMonth]);
  const days = useMemo(() => calendarDays(monthStart), [monthStart]);
  const eventsByDate = useMemo(
    () =>
      events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
        acc[event.date] = [...(acc[event.date] ?? []), event];
        return acc;
      }, {}),
    [events]
  );
  const eventDays = useMemo(
    () => Object.entries(eventsByDate).sort(([a], [b]) => a.localeCompare(b)),
    [eventsByDate]
  );
  const counts = events.reduce<Record<CalendarGroup, number>>(
    (acc, event) => {
      acc[eventGroup(event.type)] += 1;
      return acc;
    },
    { payments: 0, maintenance: 0, leases: 0, inspections: 0 }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        summary={`${events.length} scheduled item${events.length === 1 ? "" : "s"} · ${monthLabel(monthStart)}`}
        className="xl:items-end"
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex w-fit rounded-md border border-border bg-muted/40 p-1">
            <Button
              type="button"
              variant={viewMode === "month" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("month")}
            >
              <CalendarDays className="h-4 w-4" />
              Month
            </Button>
            <Button
              type="button"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/calendar?month=${monthKey(addMonths(monthStart, -1))}`}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/calendar">
                <CalendarDays className="h-4 w-4" />
                Today
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/calendar?month=${monthKey(addMonths(monthStart, 1))}`}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(Object.keys(groupStyles) as CalendarGroup[]).map((group) => {
          const style = groupStyles[group];
          const Icon = style.icon;

          return (
            <div key={group} className={cn("flex items-center justify-between rounded-lg border px-4 py-3", style.className)}>
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{style.label}</span>
              </div>
              <span className="text-xl font-bold">{counts[group]}</span>
            </div>
          );
        })}
      </div>

      {viewMode === "month" ? (
        <>
          <section className="hidden lg:block">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{monthLabel(monthStart)}</h2>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {(Object.keys(groupStyles) as CalendarGroup[]).map((group) => (
                  <span key={group} className="inline-flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", groupStyles[group].dot)} />
                    {groupStyles[group].label}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="border-b border-r border-border bg-muted/40 px-3 py-2 last:border-r-0">
                  {day}
                </div>
              ))}
              {days.map((day) => {
                const key = dateKey(day);
                const dayEvents = eventsByDate[key] ?? [];
                const inMonth = day.getMonth() === monthStart.getMonth();

                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-36 border-b border-r border-border p-2 last:border-r-0",
                      inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", inMonth ? "text-foreground" : "text-muted-foreground")}>
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 2 && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          +{dayEvents.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <EventPill key={event.id} event={event} compact />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {events.length === 0 && (
              <EmptyState
                className="mt-4"
                icon={CalendarCheck}
                title="No calendar items this month"
                description="Rent due dates, maintenance work, lease expiries, and inspections will appear here once they are scheduled."
                action={
                  <Button asChild size="sm">
                    <Link href="/rent">Review Rent</Link>
                  </Button>
                }
                secondaryAction={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/maintenance">Log Maintenance</Link>
                  </Button>
                }
              />
            )}
          </section>

          <section className="space-y-3 lg:hidden">
            <h2 className="text-base font-semibold text-foreground">{monthLabel(monthStart)}</h2>
            {eventDays.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No calendar items this month"
                description="Rent due dates, maintenance work, lease expiries, and inspections will appear here once they are scheduled."
                action={
                  <Button asChild size="sm">
                    <Link href="/rent">Review Rent</Link>
                  </Button>
                }
                secondaryAction={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/maintenance">Log Maintenance</Link>
                  </Button>
                }
              />
            ) : (
              eventDays.map(([date, dateEvents]) => (
                <div key={date} className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-3 text-sm font-semibold text-foreground">{dayLabel(date)}</p>
                  <div className="space-y-2">
                    {dateEvents.map((event) => (
                      <AgendaItem key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      ) : (
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Compact List</h2>
            <p className="text-xs text-muted-foreground">Payments, maintenance, and lease dates for {monthLabel(monthStart)}</p>
          </div>
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No calendar items this month"
              description="Rent due dates, maintenance work, lease expiries, and inspections will appear here once they are scheduled."
              action={
                <Button asChild size="sm">
                  <Link href="/rent">Review Rent</Link>
                </Button>
              }
              secondaryAction={
                <Button asChild size="sm" variant="outline">
                  <Link href="/maintenance">Log Maintenance</Link>
                </Button>
              }
            />
          ) : (
            events.map((event) => <AgendaItem key={event.id} event={event} />)
          )}
        </section>
      )}
    </div>
  );
}

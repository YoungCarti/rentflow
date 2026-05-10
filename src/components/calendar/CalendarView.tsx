"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  List,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/layout/PageHeader";
import CopyPaymentLinkButton from "@/components/payments/CopyPaymentLinkButton";
import CopyReminderMessageButton from "@/components/payments/CopyReminderMessageButton";
import { semanticTone } from "@/lib/color-system";
import { cn } from "@/lib/utils";
import type { CalendarEvent, CalendarEventType } from "@/lib/calendar";

type ViewMode = "month" | "list";
type CalendarGroup = "payments" | "maintenance" | "leases" | "inspections";
type DetailTone = "success" | "warning" | "danger" | "info" | "maintenance" | "neutral";

const groupStyles: Record<
  CalendarGroup,
  {
    label: string;
    icon: typeof Banknote;
    iconBox: string;
    iconText: string;
    soft: string;
    dot: string;
    accent: string;
  }
> = {
  payments: {
    label: "Payments",
    icon: Banknote,
    iconBox: "bg-amber-500/15",
    iconText: "text-amber-600 dark:text-amber-300",
    soft: semanticTone.pending.soft,
    dot: semanticTone.pending.bgStrong,
    accent: "border-l-amber-500",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    iconBox: "bg-violet-500/15",
    iconText: "text-violet-600 dark:text-violet-300",
    soft: semanticTone.maintenance.soft,
    dot: semanticTone.maintenance.bgStrong,
    accent: "border-l-violet-500",
  },
  leases: {
    label: "Leases",
    icon: AlertCircle,
    iconBox: "bg-red-500/15",
    iconText: "text-red-600 dark:text-red-300",
    soft: semanticTone.danger.soft,
    dot: semanticTone.danger.bgStrong,
    accent: "border-l-red-500",
  },
  inspections: {
    label: "Inspections",
    icon: CalendarCheck,
    iconBox: "bg-blue-500/15",
    iconText: "text-blue-600 dark:text-blue-300",
    soft: semanticTone.scheduled.soft,
    dot: semanticTone.scheduled.bgStrong,
    accent: "border-l-blue-500",
  },
};

function eventGroup(type: CalendarEventType): CalendarGroup {
  if (type === "rent_due") return "payments";
  if (type === "maintenance") return "maintenance";
  if (type === "inspection") return "inspections";
  return "leases";
}

function eventTypeLabel(type: CalendarEventType) {
  if (type === "rent_due") return "Payment";
  if (type === "maintenance") return "Maintenance";
  if (type === "inspection") return "Inspection";
  return "Lease expiry";
}

function groupTone(group: CalendarGroup): DetailTone {
  if (group === "payments") return "warning";
  if (group === "maintenance") return "maintenance";
  if (group === "leases") return "danger";
  return "info";
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

function daysUntil(dateStr: string) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(`${dateStr}T00:00:00`);

  return Math.ceil((end.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
}

function eventMeta(event: CalendarEvent) {
  const group = eventGroup(event.type);
  return {
    group,
    style: groupStyles[group],
  };
}

function isRentStatus(status: CalendarEvent["status"]) {
  return status === "Paid" || status === "Pending" || status === "Overdue";
}

function DetailTag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: DetailTone;
}) {
  const classes = {
    success: semanticTone.success.badge,
    warning: semanticTone.pending.badge,
    danger: semanticTone.danger.badge,
    info: semanticTone.scheduled.badge,
    maintenance: semanticTone.maintenance.badge,
    neutral: semanticTone.neutral.badge,
  };

  return (
    <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold", classes[tone])}>
      {children}
    </span>
  );
}

function statusTone(status?: string): DetailTone {
  if (status === "Paid" || status === "Resolved") return "success";
  if (status === "Overdue" || status === "Urgent") return "danger";
  if (status === "Open" || status === "Pending" || status === "Medium") return "warning";
  if (status === "In Progress" || status === "Scheduled") return "info";

  return "neutral";
}

function priorityTone(priority?: string): DetailTone {
  if (priority === "Urgent" || priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  if (priority === "Low") return "success";

  return "neutral";
}

function tagged(value?: string | null, tone?: DetailTone) {
  if (!value) return undefined;

  return <DetailTag tone={tone ?? statusTone(value)}>{value}</DetailTag>;
}

function DetailRow({ label, value }: { label: string; value?: ReactNode | null }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="grid grid-cols-[116px_1fr] gap-3 border-b border-border/70 py-2 text-sm last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function EventPill({
  event,
  active = false,
  compact = false,
  onOpen,
}: {
  event: CalendarEvent;
  active?: boolean;
  compact?: boolean;
  onOpen: (event: CalendarEvent) => void;
}) {
  const { style } = eventMeta(event);
  const Icon = style.icon;
  const supportingText =
    event.type === "rent_due" && event.amount
      ? `${formatRM(event.amount)} · ${event.propertyName ?? event.description}`
      : event.type === "maintenance" && event.priority
        ? `${event.priority} · ${event.status ?? ""}`.trim()
        : event.description;

  return (
    <button
      type="button"
      onClick={(eventClick) => {
        eventClick.stopPropagation();
        onOpen(event);
      }}
      className={cn(
        "group/event block w-full min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-card px-2.5 py-2 text-left text-xs shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "border-l-4",
        style.accent,
        active && "border-foreground/30 bg-muted shadow-sm",
        compact ? "space-y-0.5" : "space-y-1.5"
      )}
      aria-label={`Open ${event.title}`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", style.iconText)} />
        <span className="truncate font-semibold text-foreground">{event.title}</span>
      </div>
      {!compact && (
        <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
          {supportingText}
        </p>
      )}
    </button>
  );
}

function AgendaItem({
  event,
  active = false,
  onOpen,
}: {
  event: CalendarEvent;
  active?: boolean;
  onOpen: (event: CalendarEvent) => void;
}) {
  const { style } = eventMeta(event);
  const Icon = style.icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className={cn(
        "w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-foreground/20 hover:bg-muted/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "border-foreground/30 bg-muted/60 shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", style.soft)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{formatDate(event.date)}</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">{event.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {event.amount ? `${formatRM(event.amount)} · ` : ""}
            {event.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function CategoryCard({
  group,
  count,
  active,
  onClick,
}: {
  group: CalendarGroup;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const style = groupStyles[group];
  const Icon = style.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-h-28 w-full items-center gap-3 px-3 py-4 text-left transition-colors hover:bg-muted/45 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/65 xl:px-4",
        active && "bg-muted/60 shadow-[inset_0_-2px_0_var(--primary)]"
      )}
      aria-pressed={active}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105", style.iconBox)}>
          <Icon className={cn("h-4 w-4", style.iconText)} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            {style.label}
          </span>
          <span className="mt-1 block truncate text-xl font-bold leading-tight text-foreground">
            {count}
          </span>
        </span>
      </div>
    </button>
  );
}

function EventActions({ event }: { event: CalendarEvent }) {
  if (event.type === "rent_due") {
    const rentStatus = isRentStatus(event.status) ? event.status : "Pending";

    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/rent">
            <ExternalLink className="h-3.5 w-3.5" />
            Open Rent Record
          </Link>
        </Button>
        <CopyPaymentLinkButton paymentLinkId={event.paymentLinkId} size="sm" showOpen />
        {rentStatus !== "Paid" && event.paymentLinkId && event.tenantName && event.amount && event.dueDate && event.month && (
          <CopyReminderMessageButton
            mode="primary"
            tenantName={event.tenantName}
            tenantPhone={event.tenantPhone}
            tenantEmail={event.tenantEmail}
            month={event.month}
            amount={event.amount}
            dueDate={event.dueDate}
            paymentLinkId={event.paymentLinkId}
            status={rentStatus}
          />
        )}
      </div>
    );
  }

  if (event.type === "maintenance") {
    return (
      <Button asChild size="sm">
        <Link href="/maintenance">
          <ExternalLink className="h-3.5 w-3.5" />
          Open Maintenance Request
        </Link>
      </Button>
    );
  }

  if (event.tenantId) {
    return (
      <Button asChild size="sm">
        <Link href={`/tenants/${event.tenantId}`}>
          <ExternalLink className="h-3.5 w-3.5" />
          Open Tenant Details
        </Link>
      </Button>
    );
  }

  return null;
}

function EventDetails({ event }: { event: CalendarEvent }) {
  const remainingDays = event.leaseEnd ? daysUntil(event.leaseEnd) : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold leading-tight text-foreground">{event.title}</h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{event.description}</p>
      </div>

      <dl className="rounded-lg border border-border bg-muted/20 px-3">
        {event.type === "rent_due" && (
          <>
            <DetailRow label="Type" value={<DetailTag tone={groupTone(eventGroup(event.type))}>{eventTypeLabel(event.type)}</DetailTag>} />
            <DetailRow label="Tenant" value={event.tenantName} />
            <DetailRow label="Property" value={event.propertyName} />
            <DetailRow label="Unit" value={event.unitNumber ? `Unit ${event.unitNumber}` : undefined} />
            <DetailRow label="Amount" value={event.amount ? formatRM(event.amount) : undefined} />
            <DetailRow label="Due date" value={event.dueDate ? formatDate(event.dueDate) : formatDate(event.date)} />
            <DetailRow label="Status" value={tagged(event.status)} />
          </>
        )}

        {event.type === "maintenance" && (
          <>
            <DetailRow label="Type" value={<DetailTag tone={groupTone(eventGroup(event.type))}>{eventTypeLabel(event.type)}</DetailTag>} />
            <DetailRow label="Request" value={event.title} />
            <DetailRow label="Property" value={event.propertyName} />
            <DetailRow label="Unit" value={event.unitNumber ? `Unit ${event.unitNumber}` : undefined} />
            <DetailRow label="Category" value={tagged(event.category, "maintenance")} />
            <DetailRow label="Priority" value={tagged(event.priority, priorityTone(event.priority))} />
            <DetailRow label="Status" value={tagged(event.status)} />
            <DetailRow label="Reported" value={event.reportedDate ? formatDate(event.reportedDate) : formatDate(event.date)} />
          </>
        )}

        {event.type === "lease_expiry" && (
          <>
            <DetailRow label="Type" value={<DetailTag tone={groupTone(eventGroup(event.type))}>{eventTypeLabel(event.type)}</DetailTag>} />
            <DetailRow label="Tenant" value={event.tenantName} />
            <DetailRow label="Property" value={event.propertyName} />
            <DetailRow label="Unit" value={event.unitNumber ? `Unit ${event.unitNumber}` : undefined} />
            <DetailRow label="Lease end" value={event.leaseEnd ? formatDate(event.leaseEnd) : formatDate(event.date)} />
            <DetailRow label="Status" value={tagged(event.status)} />
            <DetailRow
              label="Remaining"
              value={remainingDays === null ? undefined : remainingDays >= 0 ? `${remainingDays} days` : `${Math.abs(remainingDays)} days ago`}
            />
          </>
        )}

        {event.type === "inspection" && (
          <>
            <DetailRow label="Type" value={<DetailTag tone={groupTone(eventGroup(event.type))}>{eventTypeLabel(event.type)}</DetailTag>} />
            <DetailRow label="Date" value={formatDate(event.date)} />
            <DetailRow label="Property" value={event.propertyName} />
            <DetailRow label="Unit" value={event.unitNumber ? `Unit ${event.unitNumber}` : undefined} />
            <DetailRow label="Status" value={tagged(event.displayStatus ?? "Scheduled")} />
          </>
        )}
      </dl>

      <EventActions event={event} />
    </div>
  );
}

function DayDetailsDialog({
  selectedDate,
  events,
  selectedEvent,
  selectedGroup,
  onSelectEvent,
}: {
  selectedDate: string;
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  selectedGroup: CalendarGroup | null;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const activeEvent = selectedEvent ?? events[0] ?? null;
  const selectedLabel = selectedGroup ? groupStyles[selectedGroup].label.toLowerCase() : "scheduled";

  return (
    <DialogContent className="max-h-[88vh] max-w-5xl gap-0 overflow-hidden p-0">
      <DialogHeader className="border-b border-border px-5 py-4 pr-12">
        <DialogDescription className="text-xs font-semibold uppercase tracking-normal">
          {dayLabel(selectedDate)}
        </DialogDescription>
        <DialogTitle className="text-base">
          {events.length} {selectedGroup ? selectedLabel : "event"}{events.length === 1 ? "" : "s"}
        </DialogTitle>
      </DialogHeader>

      <div className="grid max-h-[calc(88vh-78px)] gap-4 overflow-y-auto p-4 xl:grid-cols-[minmax(240px,0.85fr)_1.2fr]">
        <div className="space-y-2 xl:max-h-[calc(88vh-110px)] xl:overflow-y-auto xl:pr-1">
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No {selectedLabel} events on this date.
            </div>
          ) : (
            events.map((event) => (
              <AgendaItem
                key={event.id}
                event={event}
                active={activeEvent?.id === event.id}
                onOpen={onSelectEvent}
              />
            ))
          )}
        </div>

        <div className="min-w-0 rounded-lg border border-border bg-background p-4 xl:max-h-[calc(88vh-110px)] xl:overflow-y-auto">
          {activeEvent ? (
            <EventDetails event={activeEvent} />
          ) : (
            <div className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">
              Select a populated date to see event details.
            </div>
          )}
        </div>
      </div>
    </DialogContent>
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
  const [selectedGroup, setSelectedGroup] = useState<CalendarGroup | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const monthStart = useMemo(() => parseMonthKey(selectedMonth), [selectedMonth]);
  const days = useMemo(() => calendarDays(monthStart), [monthStart]);
  const todayKey = useMemo(() => dateKey(new Date()), []);
  const filteredEvents = useMemo(
    () => events.filter((event) => !selectedGroup || eventGroup(event.type) === selectedGroup),
    [events, selectedGroup]
  );
  const eventsByDate = useMemo(
    () =>
      filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
        acc[event.date] = [...(acc[event.date] ?? []), event];
        return acc;
      }, {}),
    [filteredEvents]
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
  const visibleSelectedDate = selectedDate?.startsWith(selectedMonth) ? selectedDate : null;
  const selectedDateEvents = visibleSelectedDate ? eventsByDate[visibleSelectedDate] ?? [] : [];
  const selectedGroupLabel = selectedGroup ? groupStyles[selectedGroup].label : null;

  function toggleGroup(group: CalendarGroup) {
    setSelectedGroup((current) => (current === group ? null : group));
    setSelectedDate(null);
    setSelectedEvent(null);
  }

  function openDate(day: string) {
    setSelectedDate(day);
    setSelectedEvent(null);
  }

  function openEvent(event: CalendarEvent) {
    setSelectedDate(event.date);
    setSelectedEvent(event);
  }

  function filteredEmptyState() {
    return (
      <EmptyState
        icon={CalendarCheck}
        title={selectedGroupLabel ? `No ${selectedGroupLabel.toLowerCase()} this month` : "No calendar items this month"}
        description={
          selectedGroupLabel
            ? `${monthLabel(monthStart)} has scheduled items, but none match ${selectedGroupLabel.toLowerCase()}.`
            : "Rent due dates, maintenance work, lease expiries, and inspections will appear here once they are scheduled."
        }
        action={
          selectedGroupLabel ? (
            <Button size="sm" onClick={() => setSelectedGroup(null)}>
              Show All Categories
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/rent">Review Rent</Link>
            </Button>
          )
        }
        secondaryAction={
          <Button asChild size="sm" variant="outline">
            <Link href="/maintenance">Log Maintenance</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        summary={`${filteredEvents.length} of ${events.length} scheduled item${events.length === 1 ? "" : "s"} · ${monthLabel(monthStart)}`}
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

      <div className="-mx-6 border-y border-border bg-card/45 px-6">
        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {(Object.keys(groupStyles) as CalendarGroup[]).map((group) => (
            <CategoryCard
              key={group}
              group={group}
              count={counts[group]}
              active={selectedGroup === group}
              onClick={() => toggleGroup(group)}
            />
          ))}
        </div>
      </div>

      {viewMode === "month" ? (
        filteredEvents.length === 0 ? (
          filteredEmptyState()
        ) : (
          <>
            <section className="hidden lg:block">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  {selectedGroupLabel ? `${selectedGroupLabel} · ` : ""}
                  {monthLabel(monthStart)}
                </h2>
                {selectedGroup && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGroup(null);
                      setSelectedDate(null);
                      setSelectedEvent(null);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="min-w-0 border-b border-r border-border bg-muted/40 px-3 py-2 last:border-r-0">
                    {day}
                  </div>
                ))}
                {days.map((day) => {
                  const key = dateKey(day);
                  const dayEvents = eventsByDate[key] ?? [];
                  const inMonth = day.getMonth() === monthStart.getMonth();
                  const isToday = key === todayKey;
                  const isSelected = selectedDate === key;

                  return (
                    <div
                      key={key}
                      role={dayEvents.length > 0 ? "button" : undefined}
                      tabIndex={dayEvents.length > 0 ? 0 : undefined}
                      onClick={() => dayEvents.length > 0 && openDate(key)}
                      onKeyDown={(event) => {
                        if (dayEvents.length === 0) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDate(key);
                        }
                      }}
                      className={cn(
                        "min-h-36 min-w-0 overflow-hidden border-b border-r border-border p-2 transition-colors last:border-r-0",
                        inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground",
                        dayEvents.length > 0 && "cursor-pointer hover:bg-muted/35",
                        isSelected && key.startsWith(selectedMonth) && "bg-muted/60 ring-2 ring-inset ring-primary/35"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold",
                            inMonth ? "text-foreground" : "text-muted-foreground",
                            isToday && "bg-primary text-primary-foreground shadow-sm"
                          )}
                        >
                          {day.getDate()}
                        </span>
                        <div className="flex items-center gap-1">
                          {isToday && (
                            <span className="rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-normal text-primary">
                              Today
                            </span>
                          )}
                          {dayEvents.length > 2 && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openDate(key);
                              }}
                              className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={`Show ${dayEvents.length - 2} more events for ${formatDate(key)}`}
                            >
                              +{dayEvents.length - 2}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {dayEvents.slice(0, 2).map((event) => (
                          <EventPill
                            key={event.id}
                            event={event}
                            active={selectedEvent?.id === event.id}
                            compact
                            onOpen={openEvent}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3 lg:hidden">
              <h2 className="text-base font-semibold text-foreground">
                {selectedGroupLabel ? `${selectedGroupLabel} · ` : ""}
                {monthLabel(monthStart)}
              </h2>
              {eventDays.map(([date, dateEvents]) => (
                <div key={date} className="rounded-lg border border-border bg-card p-3">
                  <button
                    type="button"
                    onClick={() => openDate(date)}
                    className="mb-3 flex w-full items-center justify-between gap-3 text-left"
                  >
                    <p className="text-sm font-semibold text-foreground">{dayLabel(date)}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      {dateEvents.length}
                    </span>
                  </button>
                  <div className="space-y-2">
                    {dateEvents.map((event) => (
                      <AgendaItem
                        key={event.id}
                        event={event}
                        active={selectedEvent?.id === event.id}
                        onOpen={openEvent}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </>
        )
      ) : (
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {selectedGroupLabel ? `${selectedGroupLabel} List` : "Compact List"}
            </h2>
            <p className="text-xs text-muted-foreground">Payments, maintenance, leases, and inspections for {monthLabel(monthStart)}</p>
          </div>
          {filteredEvents.length === 0 ? (
            filteredEmptyState()
          ) : (
            filteredEvents.map((event) => (
              <AgendaItem
                key={event.id}
                event={event}
                active={selectedEvent?.id === event.id}
                onOpen={openEvent}
              />
            ))
          )}
        </section>
      )}

      <Dialog
        open={Boolean(visibleSelectedDate)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDate(null);
            setSelectedEvent(null);
          }
        }}
      >
        {visibleSelectedDate && (
          <DayDetailsDialog
            selectedDate={visibleSelectedDate}
            events={selectedDateEvents}
            selectedEvent={selectedEvent}
            selectedGroup={selectedGroup}
            onSelectEvent={setSelectedEvent}
          />
        )}
      </Dialog>
    </div>
  );
}

import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCalendarEvents, type CalendarEvent, type CalendarEventType } from "@/lib/calendar";
import { cn } from "@/lib/utils";

const eventStyles: Record<
  CalendarEventType,
  { label: string; icon: typeof Banknote; className: string; dot: string }
> = {
  rent_due: {
    label: "Rent",
    icon: Banknote,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
  lease_expiry: {
    label: "Lease",
    icon: AlertCircle,
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  inspection: {
    label: "Inspection",
    icon: ClipboardCheck,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    className: "border-violet-200 bg-violet-50 text-violet-800",
    dot: "bg-violet-500",
  },
};

function parseMonth(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  return date.toISOString().slice(0, 10);
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

function EventPill({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const style = eventStyles[event.type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "min-w-0 rounded-md border px-2 py-1 text-xs",
        style.className,
        compact ? "space-y-0.5" : "space-y-1"
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate font-semibold">{event.title}</span>
      </div>
      {!compact && (
        <p className="truncate text-[11px] opacity-80">
          {event.amount ? `${formatRM(event.amount)} · ` : ""}
          {event.description}
        </p>
      )}
    </div>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const selectedMonth = parseMonth(month);
  const events = await getCalendarEvents(selectedMonth);
  const days = calendarDays(selectedMonth);
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    acc[event.date] = [...(acc[event.date] ?? []), event];
    return acc;
  }, {});
  const counts = events.reduce<Record<CalendarEventType, number>>(
    (acc, event) => {
      acc[event.type] += 1;
      return acc;
    },
    { rent_due: 0, lease_expiry: 0, inspection: 0, maintenance: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} scheduled item{events.length === 1 ? "" : "s"} · {monthLabel(selectedMonth)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/calendar?month=${monthKey(addMonths(selectedMonth, -1))}`}>
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
            <Link href={`/calendar?month=${monthKey(addMonths(selectedMonth, 1))}`}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(Object.keys(eventStyles) as CalendarEventType[]).map((type) => {
          const style = eventStyles[type];
          const Icon = style.icon;

          return (
            <Card key={type} className="shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", style.className)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{style.label}</p>
                  <p className="text-xl font-bold text-foreground">{counts[type]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{monthLabel(selectedMonth)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 border-l border-t border-border text-xs font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="border-b border-r border-border px-2 py-2">
                  {day}
                </div>
              ))}
              {days.map((day) => {
                const key = dateKey(day);
                const dayEvents = eventsByDate[key] ?? [];
                const inMonth = day.getMonth() === selectedMonth.getMonth();

                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-32 border-b border-r border-border p-2",
                      inMonth ? "bg-card" : "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", inMonth ? "text-foreground" : "text-muted-foreground")}>
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 3 && (
                        <span className="text-[11px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <EventPill key={event.id} event={event} compact />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Monthly Agenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">No events this month.</p>
              </div>
            ) : (
              events.map((event) => {
                const style = eventStyles[event.type];

                return (
                  <div key={event.id} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatDate(event.date)}
                        </p>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {event.title}
                        </p>
                      </div>
                      <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", style.dot)} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.amount ? `${formatRM(event.amount)} · ` : ""}
                      {event.description}
                    </p>
                    {event.status && (
                      <div className="mt-2">
                        <StatusBadge status={event.status} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

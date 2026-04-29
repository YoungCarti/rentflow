import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DoorOpen,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { semanticTone } from "@/lib/color-system";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard";

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const today = new Date();
  const end = new Date(dateStr);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRelativeDate(dateStr: string) {
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const days = Math.round(
    (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (Math.abs(days) < 1) {
    return "today";
  }

  return formatter.format(days, "day");
}

function getStatCards(stats: DashboardStats) {
  return [
    {
      label: "Properties",
      value: stats.totalProperties,
      icon: Building2,
      color: semanticTone.neutral.textSoft,
      bg: semanticTone.neutral.bg,
    },
    {
      label: "Units",
      value: stats.totalUnits,
      icon: DoorOpen,
      color: semanticTone.neutral.textSoft,
      bg: semanticTone.neutral.bg,
    },
    {
      label: "Occupied",
      value: `${stats.occupiedUnits} (${stats.occupancyRate}%)`,
      icon: CheckCircle2,
      color: semanticTone.success.textSoft,
      bg: semanticTone.success.bg,
    },
    {
      label: "Vacant",
      value: stats.vacantUnits,
      icon: XCircle,
      color: semanticTone.neutral.textSoft,
      bg: semanticTone.neutral.bg,
    },
    {
      label: "Tenants",
      value: stats.tenantCount,
      icon: Users,
      color: semanticTone.neutral.textSoft,
      bg: semanticTone.neutral.bg,
    },
    {
      label: "Revenue",
      value: formatRM(stats.monthlyIncome),
      icon: TrendingUp,
      color: semanticTone.success.textSoft,
      bg: semanticTone.success.bg,
    },
    {
      label: "Overdue",
      value: formatRM(stats.overdueRent),
      icon: AlertCircle,
      color: semanticTone.danger.textSoft,
      bg: semanticTone.danger.bg,
    },
  ];
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const statCards = getStatCards(stats);
  const monthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Portfolio operations overview · {monthLabel}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Collection focus</span>
          <span
            className={`font-semibold ${
              stats.overdueRent > 0 ? semanticTone.danger.textSoft : semanticTone.success.textSoft
            }`}
          >
            {stats.overdueRent > 0 ? formatRM(stats.overdueRent) : "Clear"}
          </span>
        </div>
      </div>

      <div className="-mx-6 border-y border-border bg-card/45 px-6">
        <div className="grid grid-cols-2 divide-y divide-border sm:grid-cols-3 xl:grid-cols-7 xl:divide-x xl:divide-y-0">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex min-h-28 items-center gap-3 px-3 py-4 first:pl-0 xl:first:pl-3"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 truncate text-xl font-bold leading-tight text-foreground">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Monthly Rent Collection
              </h2>
              <p className="text-xs text-muted-foreground">Approved payments by month</p>
            </div>
            <span className={`text-sm font-semibold ${semanticTone.success.textSoft}`}>
              {formatRM(stats.monthlyIncome)}
            </span>
          </div>
          <div className="border-t border-border pt-4">
            <RevenueChart data={stats.chartData} />
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Upcoming Lease Expiries
            </h2>
            <p className="text-xs text-muted-foreground">Next 120 days</p>
          </div>
          <div className="border-t border-border">
            {stats.upcomingLeaseExpiries.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                No leases expiring in the next 120 days.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.upcomingLeaseExpiries.map((t) => {
                  const days = daysUntil(t.leaseEnd);
                  const urgent = days <= 30;

                  return (
                    <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-tight text-foreground">
                          {t.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.propertyName} · Unit {t.unitNumber}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.leaseEnd)}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            urgent ? semanticTone.danger.textSoft : semanticTone.pending.textSoft
                          }`}
                        >
                          {days}d left
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">
            Latest properties, units, payments, and tenants
          </p>
        </div>
        <div className="overflow-hidden border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-0">Activity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="pr-0 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    No activity yet. Add a property, unit, or tenant to start building your dashboard.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="pl-0 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            activity.tone === "green"
                              ? semanticTone.success.bgStrong
                              : activity.tone === "amber"
                                ? semanticTone.pending.bgStrong
                                : semanticTone.scheduled.bgStrong
                          }`}
                        />
                        {activity.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{activity.detail}</TableCell>
                    <TableCell className="pr-0 text-right text-muted-foreground">
                      {formatRelativeDate(activity.date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

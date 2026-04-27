import {
  Building2,
  DoorOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Stat card data ───────────────────────────────────────────────────────────

function getStatCards(stats: DashboardStats) {
  return [
    {
      label: "Total Properties",
      value: stats.totalProperties,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Units",
      value: stats.totalUnits,
      icon: DoorOpen,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Occupied Units",
      value: `${stats.occupiedUnits} (${stats.occupancyRate}%)`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Vacant Units",
      value: stats.vacantUnits,
      icon: XCircle,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "Tenants",
      value: stats.tenantCount,
      icon: Users,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Monthly Revenue",
      value: formatRM(stats.monthlyIncome),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Overdue Rent",
      value: formatRM(stats.overdueRent),
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const statCards = getStatCards(stats);
  const monthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of your portfolio — {monthLabel}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue chart — 3/5 width on large screens */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Monthly Rent Collection
            </CardTitle>
            <p className="text-xs text-muted-foreground">Approved payments by month</p>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueChart data={stats.chartData} />
          </CardContent>
        </Card>

        {/* Upcoming lease expiries — 2/5 width */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Upcoming Lease Expiries
            </CardTitle>
            <p className="text-xs text-muted-foreground">Next 120 days</p>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {stats.upcomingLeaseExpiries.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted-foreground">
                No leases expiring in the next 120 days.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.upcomingLeaseExpiries.map((t) => {
                  const days = daysUntil(t.leaseEnd);
                  const urgent = days <= 30;
                  return (
                    <li key={t.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.propertyName} · Unit {t.unitNumber}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.leaseEnd)}
                        </p>
                        <p className={`text-xs font-semibold ${urgent ? "text-red-600" : "text-amber-600"}`}>
                          {days}d left
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <p className="text-xs text-muted-foreground">Latest properties, units, and tenants</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Activity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date</TableHead>
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
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            activity.tone === "green"
                              ? "bg-green-500"
                              : activity.tone === "amber"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                        {activity.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{activity.detail}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeDate(activity.date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

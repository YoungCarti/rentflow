import {
  Building2,
  DoorOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
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
import StatusBadge from "@/components/ui/StatusBadge";
import RevenueChart from "@/components/dashboard/RevenueChart";
import {
  getTotalProperties,
  getTotalUnits,
  getOccupiedUnits,
  getVacantUnits,
  getMonthlyRevenue,
  getOverdueAmount,
  getRecentPayments,
  getUpcomingLeaseExpiries,
} from "@/lib/data";

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
  const today = new Date("2026-04-26");
  const end = new Date(dateStr);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Stat card data ───────────────────────────────────────────────────────────

function getStatCards() {
  return [
    {
      label: "Total Properties",
      value: getTotalProperties(),
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Units",
      value: getTotalUnits(),
      icon: DoorOpen,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Occupied Units",
      value: getOccupiedUnits(),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Vacant Units",
      value: getVacantUnits(),
      icon: XCircle,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "Monthly Revenue",
      value: formatRM(getMonthlyRevenue()),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Overdue Rent",
      value: formatRM(getOverdueAmount()),
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const statCards = getStatCards();
  const recentPayments = getRecentPayments(6);
  const leaseExpiries = getUpcomingLeaseExpiries(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of your properties — April 2026
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
            <p className="text-xs text-muted-foreground">Nov 2025 – Apr 2026</p>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueChart />
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
            <ul className="divide-y divide-border">
              {leaseExpiries.map((t) => {
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
          </CardContent>
        </Card>
      </div>

      {/* Recent payments */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
          <p className="text-xs text-muted-foreground">Last 6 approved transactions</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Tenant</TableHead>
                <TableHead>Property · Unit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.tenantName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.propertyName} · {p.unitNumber}
                  </TableCell>
                  <TableCell className="font-semibold">{formatRM(p.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

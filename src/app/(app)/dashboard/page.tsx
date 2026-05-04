import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  FileBarChart2,
  ReceiptText,
  TrendingUp,
  Users,
  UserPlus,
  Wrench,
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
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { semanticTone } from "@/lib/color-system";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";

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

function getUserDisplayName(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const firstName = typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName = typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return user.email?.split("@")[0] || "there";
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

// ─── Quick Actions ───────────────────────────────────────────────────────────────

const quickActions = [
  {
    label: "Add Property",
    href: "/properties",
    icon: Building2,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Add Tenant",
    href: "/tenants",
    icon: UserPlus,
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Record Rent",
    href: "/rent",
    icon: ReceiptText,
    iconBg: "bg-green-500/10 dark:bg-green-500/15",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    label: "Log Maintenance",
    href: "/maintenance",
    icon: Wrench,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "View Calendar",
    href: "/calendar",
    icon: CalendarDays,
    iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    label: "View Reports",
    href: "/reports",
    icon: FileBarChart2,
    iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {quickActions.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
        <Link
          key={label}
          href={href}
          className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card px-3 py-5 text-center transition-all hover:border-foreground/20 hover:bg-muted hover:shadow-md active:scale-[0.97]"
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-110`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </span>
          <span className="text-xs font-semibold leading-tight text-foreground">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Lease Expiry Card ───────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LeaseExpiryCard({
  tenant,
}: {
  tenant: {
    id: string;
    name: string;
    propertyName: string;
    unitNumber: string;
    leaseEnd: string;
  };
}) {
  const days = daysUntil(tenant.leaseEnd);
  const isUrgent = days <= 30;
  const isWarning = days > 30 && days <= 60;

  const urgencyClass = isUrgent
    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30"
    : isWarning
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30"
      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/30";

  const dotClass = isUrgent ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
      {/* Initials avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {getInitials(tenant.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{tenant.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {tenant.propertyName} &middot; Unit {tenant.unitNumber}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {new Date(tenant.leaseEnd).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Urgency badge */}
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${urgencyClass}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        {days}d left
      </span>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await getDashboardStats();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const statCards = getStatCards(stats);
  const userName = user ? getUserDisplayName(user) : "there";
  const monthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-7">
      <DashboardHeader
        userName={userName}
        monthLabel={monthLabel}
        overdueRent={stats.overdueRent}
      />

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

      {/* ── Quick Actions ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </p>
        <QuickActions />
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Upcoming Lease Expiries
              </h2>
              <p className="text-xs text-muted-foreground">Next 120 days</p>
            </div>
            {stats.upcomingLeaseExpiries.length > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {stats.upcomingLeaseExpiries.length}
              </span>
            )}
          </div>
          <div className="border-t border-border pt-3">
            {stats.upcomingLeaseExpiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
                <CheckCircle2 className="mb-2 h-7 w-7 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">All clear</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  No leases expiring in the next 120 days
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.upcomingLeaseExpiries.map((t) => (
                  <LeaseExpiryCard key={t.id} tenant={t} />
                ))}
              </div>
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
                          className={`h-2 w-2 rounded-full ${activity.tone === "green"
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

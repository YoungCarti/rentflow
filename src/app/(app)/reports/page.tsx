import Link from "next/link";
import { Trophy, TrendingUp, AlertCircle, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import PageHeader from "@/components/layout/PageHeader";
import RevenueBarChart from "@/components/reports/RevenueBarChart";
import OccupancyLineChart from "@/components/reports/OccupancyLineChart";
import { properties, units, rentRecords } from "@/lib/data";

function formatRM(n: number) {
  return `RM ${n.toLocaleString()}`;
}

// ─── Derived stats ────────────────────────────────────────────────────────────

function buildReports() {
  const paid    = rentRecords.filter((r) => r.status === "Paid");
  const overdue = rentRecords.filter((r) => r.status === "Overdue");
  const pending = rentRecords.filter((r) => r.status === "Pending");

  const totalCollected = paid.reduce((s, r) => s + r.amount, 0);
  const totalOverdue   = overdue.reduce((s, r) => s + r.amount, 0);
  const totalExpected  = rentRecords.reduce((s, r) => s + r.amount, 0);
  const collectionRate = Math.round((totalCollected / totalExpected) * 100);

  const occupiedCount = units.filter((u) => u.status === "Occupied").length;
  const avgOccupancy  = Math.round((occupiedCount / units.length) * 100);

  // Per-property breakdown
  const propStats = properties.map((p) => {
    const propUnits    = units.filter((u) => u.propertyId === p.id);
    const occupied     = propUnits.filter((u) => u.status === "Occupied").length;
    const occupancy    = Math.round((occupied / propUnits.length) * 100);
    const propRecords  = rentRecords.filter((r) =>
      propUnits.some((u) => u.unitNumber === r.unitNumber && u.propertyId === p.id)
    );
    const collected    = propRecords.filter((r) => r.status === "Paid").reduce((s, r) => s + r.amount, 0);
    const propOverdue  = propRecords.filter((r) => r.status === "Overdue").length;
    return { ...p, occupancy, collected, overdueCount: propOverdue };
  });

  const best = [...propStats].sort((a, b) => b.monthlyIncome - a.monthlyIncome)[0];

  return {
    totalCollected,
    totalOverdue,
    totalExpected,
    collectionRate,
    avgOccupancy,
    overdueCount: overdue.length,
    pendingCount: pending.length,
    propStats,
    best,
  };
}

export default function ReportsPage() {
  if (properties.length === 0 && rentRecords.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          summary="Financial and occupancy summary"
          action={
            <Button asChild size="sm">
              <Link href="/properties/new">Add Property</Link>
            </Button>
          }
        />

        <EmptyState
          icon={BarChart2}
          title="No report data yet"
          description="Create a property, add units, and start tracking rent so RentFlow can build financial and occupancy reports."
          action={
            <Button asChild size="sm">
              <Link href="/properties/new">Add Property</Link>
            </Button>
          }
          secondaryAction={
            <Button asChild size="sm" variant="outline">
              <Link href="/rent">Open Rent Tracking</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const r = buildReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        summary="Financial and occupancy summary · Feb – Apr 2026"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/rent">Open Rent Tracking</Link>
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="text-lg font-bold text-foreground">{formatRM(r.totalCollected)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-bold text-red-600">{formatRM(r.totalOverdue)}</p>
              <p className="text-xs text-red-400">{r.overdueCount} records</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collection Rate</p>
              <p className="text-lg font-bold text-foreground">{r.collectionRate}%</p>
              <p className="text-xs text-muted-foreground">of {formatRM(r.totalExpected)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50">
              <Trophy className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Property</p>
              <p className="text-sm font-bold text-foreground leading-tight">{r.best.name}</p>
              <p className="text-xs text-emerald-600">{formatRM(r.best.monthlyIncome)} / mo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
            <p className="text-xs text-muted-foreground">
              Current month highlighted · dashed line = 6-month average
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueBarChart />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Occupancy Rate</CardTitle>
            <p className="text-xs text-muted-foreground">
              % of units occupied · target line at 80%
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <OccupancyLineChart />
          </CardContent>
        </Card>
      </div>

      {/* Per-property breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Property Performance</CardTitle>
          <p className="text-xs text-muted-foreground">
            Breakdown by property across all recorded months
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Property</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Location</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-center">
                  Occupancy
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-right">
                  Monthly Income
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-right">
                  Rent Collected
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-center">
                  Overdue
                </th>
              </tr>
            </thead>
            <tbody>
              {r.propStats.map((p, i) => (
                <tr
                  key={p.id}
                  className={`${
                    i < r.propStats.length - 1 ? "border-b border-border" : ""
                  } hover:bg-muted/30 transition-colors ${
                    p.id === r.best.id ? "bg-emerald-50/40" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {p.id === r.best.id && (
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.location}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-semibold ${
                          p.occupancy >= 80
                            ? "text-green-600"
                            : p.occupancy >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {p.occupancy}%
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.occupancy >= 80
                              ? "bg-green-500"
                              : p.occupancy >= 50
                              ? "bg-amber-400"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${p.occupancy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                    {formatRM(p.monthlyIncome)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">
                    {formatRM(p.collected)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {p.overdueCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        {p.overdueCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

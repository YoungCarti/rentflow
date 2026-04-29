import Link from "next/link";
import { Trophy, TrendingUp, AlertCircle, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import PageHeader from "@/components/layout/PageHeader";
import RevenueBarChart from "@/components/reports/RevenueBarChart";
import OccupancyLineChart from "@/components/reports/OccupancyLineChart";
import { getReportsStats } from "@/lib/reports";

function formatRM(n: number) {
  return `RM ${n.toLocaleString()}`;
}

export default async function ReportsPage() {
  const r = await getReportsStats();

  if (r.propStats.length === 0 && r.totalExpected === 0) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        summary={`Financial and occupancy summary · ${r.rangeLabel}`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/rent">Open Rent Tracking</Link>
          </Button>
        }
      />

      <div className="-mx-6 border-y border-border bg-card/35 px-6">
        <div className="grid grid-cols-2 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
          <div className="flex min-h-24 items-center gap-3 px-3 py-4 first:pl-0 md:first:pl-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="truncate text-lg font-bold text-foreground">
                {formatRM(r.totalCollected)}
              </p>
            </div>
          </div>

          <div className="flex min-h-24 items-center gap-3 px-3 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="truncate text-lg font-bold text-red-600">
                {formatRM(r.totalOverdue)}
              </p>
              <p className="text-xs text-red-400">{r.overdueCount} records</p>
            </div>
          </div>

          <div className="flex min-h-24 items-center gap-3 px-3 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Collection Rate</p>
              <p className="text-lg font-bold text-foreground">{r.collectionRate}%</p>
              <p className="text-xs text-muted-foreground">of {formatRM(r.totalExpected)}</p>
            </div>
          </div>

          <div className="flex min-h-24 items-center gap-3 px-3 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-50">
              <Trophy className="w-5 h-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Best Property</p>
              <p className="truncate text-sm font-bold leading-tight text-foreground">
                {r.best?.name ?? "No properties"}
              </p>
              <p className="text-xs text-emerald-600">
                {formatRM(r.best?.monthlyIncome ?? 0)} / mo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Monthly Revenue</h2>
            <p className="text-xs text-muted-foreground">
              Current month highlighted · dashed line = 6-month average
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <RevenueBarChart data={r.revenueChart} />
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Occupancy Rate</h2>
            <p className="text-xs text-muted-foreground">
              % of units occupied · target line at 80%
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <OccupancyLineChart data={r.occupancyChart} />
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Property Performance</h2>
          <p className="text-xs text-muted-foreground">
            Breakdown by property across all recorded months
          </p>
        </div>
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full min-w-[760px] text-sm">
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
                    p.id === r.best?.id ? "bg-emerald-50/40" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {p.id === r.best?.id && (
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
        </div>
      </section>
    </div>
  );
}

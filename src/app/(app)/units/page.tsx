import Link from "next/link";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { units, properties } from "@/lib/data";

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
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property: propertyFilter } = await searchParams;

  const filtered = propertyFilter
    ? units.filter((u) => u.propertyId === propertyFilter)
    : units;

  const activeProperty = propertyFilter
    ? properties.find((p) => p.id === propertyFilter)
    : null;

  // Summary counts
  const occupied    = filtered.filter((u) => u.status === "Occupied").length;
  const vacant      = filtered.filter((u) => u.status === "Vacant").length;
  const maintenance = filtered.filter((u) => u.status === "Maintenance").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Units</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeProperty ? (
              <>Showing units for <span className="font-medium text-foreground">{activeProperty.name}</span></>
            ) : (
              `All ${units.length} units across ${properties.length} properties`
            )}
          </p>
        </div>

        {/* Clear filter button */}
        {activeProperty && (
          <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Link href="/units">
              <X className="w-3.5 h-3.5" />
              Clear filter
            </Link>
          </Button>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border shadow-sm text-sm">
          <span className="font-bold text-foreground">{filtered.length}</span>
          <span className="text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-100 text-sm">
          <span className="font-bold text-green-700">{occupied}</span>
          <span className="text-green-600">Occupied</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
          <span className="font-bold text-slate-600">{vacant}</span>
          <span className="text-slate-500">Vacant</span>
        </div>
        {maintenance > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border border-orange-100 text-sm">
            <span className="font-bold text-orange-700">{maintenance}</span>
            <span className="text-orange-600">Maintenance</span>
          </div>
        )}
      </div>

      {/* Property filter pills (shown when no filter is active) */}
      {!activeProperty && (
        <div className="flex flex-wrap gap-2">
          {properties.map((p) => (
            <Button key={p.id} asChild variant="outline" size="sm">
              <Link href={`/units?property=${p.id}`}>{p.name}</Link>
            </Button>
          ))}
        </div>
      )}

      {/* Units table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {activeProperty ? activeProperty.name : "All Units"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Unit</TableHead>
                {!activeProperty && <TableHead>Property</TableHead>}
                <TableHead>Tenant</TableHead>
                <TableHead>Rent / mo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const due = u.dueDate ? daysUntil(u.dueDate) : null;
                const overdueDue = due !== null && due < 0;
                const soonDue = due !== null && due >= 0 && due <= 5;

                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold">#{u.unitNumber}</TableCell>
                    {!activeProperty && (
                      <TableCell className="text-muted-foreground text-sm">
                        {u.propertyName}
                      </TableCell>
                    )}
                    <TableCell>
                      {u.tenantName ? (
                        <span className="font-medium">{u.tenantName}</span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatRM(u.rent)}</TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell>
                      {u.dueDate ? (
                        <span
                          className={
                            overdueDue
                              ? "text-red-600 font-semibold text-sm"
                              : soonDue
                              ? "text-amber-600 font-semibold text-sm"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {formatDate(u.dueDate)}
                          {soonDue && (
                            <span className="ml-1 text-xs">({due}d)</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

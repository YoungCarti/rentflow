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
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { semanticTone } from "@/lib/color-system";
import type { OccupancyStatus, Property, Unit } from "@/types";

type UnitRow = {
  id: string;
  property_id: string;
  unit_number: string;
  rent: number | string;
  status: OccupancyStatus;
  tenant_name: string | null;
  due_date: string | null;
};

type PropertyRow = {
  id: string;
  name: string;
  location: string;
  units?: UnitRow[];
};

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function daysUntil(dateStr: string) {
  const today = new Date();
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function DueDatePill({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) {
    return <span className="text-muted-foreground italic text-sm">—</span>;
  }

  const days = daysUntil(dateStr);
  const isOverdue = days < 0;
  const isSoon = days >= 0 && days <= 5;

  const label = isOverdue
    ? `${Math.abs(days)}d overdue`
    : days === 0
      ? "Due today"
      : `${days}d left`;

  const styles = isOverdue
    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30"
    : isSoon
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30"
      : "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-400/30";

  const dot = isOverdue ? "bg-red-500" : isSoon ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground">
        {new Date(dateStr).toLocaleDateString("en-MY", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    </div>
  );
}

function mapPropertiesAndUnits(rows: PropertyRow[]) {
  const properties: Property[] = rows.map((property) => {
    const units = property.units ?? [];
    return {
      id: property.id,
      name: property.name,
      location: property.location,
      unitCount: units.length,
      occupiedCount: units.filter((unit) => unit.status === "Occupied").length,
      monthlyIncome: units.reduce((sum, unit) => sum + Number(unit.rent), 0),
    };
  });

  const units: Unit[] = rows.flatMap((property) =>
    (property.units ?? []).map((unit) => ({
      id: unit.id,
      propertyId: unit.property_id,
      propertyName: property.name,
      unitNumber: unit.unit_number,
      rent: Number(unit.rent),
      tenantName: unit.tenant_name,
      status: unit.status,
      dueDate: unit.due_date,
    }))
  );

  return { properties, units };
}

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property: propertyFilter } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, name, location, units ( id, property_id, unit_number, rent, status, tenant_name, due_date )"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-center text-muted-foreground">Unable to load units.</div>;
  }

  const { properties, units } = mapPropertiesAndUnits((data ?? []) as PropertyRow[]);

  const filtered = propertyFilter
    ? units.filter((u) => u.propertyId === propertyFilter)
    : units;

  const activeProperty = propertyFilter
    ? properties.find((p) => p.id === propertyFilter)
    : null;

  // Summary counts
  const totalUnits  = filtered.length;
  const occupied    = filtered.filter((u) => u.status === "Occupied").length;
  const vacant      = filtered.filter((u) => u.status === "Vacant").length;
  const maintenance = filtered.filter((u) => u.status === "Maintenance").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        summary={
          activeProperty ? (
            <>Showing units for <span className="font-medium text-foreground">{activeProperty.name}</span></>
          ) : (
            `All ${units.length} units across ${properties.length} properties`
          )
        }
        action={
          activeProperty ? (
          <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Link href="/units">
              <X className="w-3.5 h-3.5" />
              Clear filter
            </Link>
          </Button>
          ) : null
        }
      />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border shadow-sm text-sm">
          <span className="font-bold text-foreground">{totalUnits}</span>
          <span className="text-muted-foreground">Total Units</span>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${semanticTone.success.surface}`}>
          <span className={`font-bold ${semanticTone.success.text}`}>{occupied}</span>
          <span className={semanticTone.success.textSoft}>Occupied</span>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${semanticTone.neutral.surface}`}>
          <span className={`font-bold ${semanticTone.neutral.text}`}>{vacant}</span>
          <span className={semanticTone.neutral.textSoft}>Vacant</span>
        </div>
        {maintenance > 0 && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${semanticTone.maintenance.surface}`}>
            <span className={`font-bold ${semanticTone.maintenance.text}`}>{maintenance}</span>
            <span className={semanticTone.maintenance.textSoft}>Maintenance</span>
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
                      <DueDatePill dateStr={u.dueDate} />
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

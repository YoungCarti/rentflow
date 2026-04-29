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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const today = new Date();
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
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

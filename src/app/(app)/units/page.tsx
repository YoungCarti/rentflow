import Link from "next/link";
import { Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { semanticTone } from "@/lib/color-system";
import { cn } from "@/lib/utils";
import type { OccupancyStatus, Property, Unit } from "@/types";

type UnitsSort = "unit" | "rent" | "property" | "status";

const occupancyStatuses: OccupancyStatus[] = ["Occupied", "Vacant", "Maintenance"];
const sortOptions: { value: UnitsSort; label: string }[] = [
  { value: "unit", label: "Unit number" },
  { value: "rent", label: "Rent" },
  { value: "property", label: "Property" },
  { value: "status", label: "Status" },
];

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
  searchParams: Promise<{
    property?: string;
    q?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const {
    property: propertyFilter = "",
    q: searchQuery = "",
    status = "",
    sort = "unit",
  } = await searchParams;
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

  const statusFilter = occupancyStatuses.includes(status as OccupancyStatus)
    ? (status as OccupancyStatus)
    : "";
  const sortBy = sortOptions.some((option) => option.value === sort)
    ? (sort as UnitsSort)
    : "unit";
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const contextFiltered = units
    .filter((unit) => !propertyFilter || unit.propertyId === propertyFilter)
    .filter((unit) => {
      if (!normalizedSearch) return true;

      return [unit.unitNumber, unit.tenantName ?? "", unit.propertyName].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    });

  const filtered = contextFiltered
    .filter((unit) => !statusFilter || unit.status === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "rent":
          return a.rent - b.rent;
        case "property":
          return (
            a.propertyName.localeCompare(b.propertyName, undefined, { numeric: true }) ||
            a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
          );
        case "status":
          return (
            a.status.localeCompare(b.status) ||
            a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
          );
        case "unit":
        default:
          return a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true });
      }
    });

  const activeProperty = propertyFilter
    ? properties.find((p) => p.id === propertyFilter)
    : null;
  const hasActiveFilters = Boolean(propertyFilter || normalizedSearch || statusFilter || sortBy !== "unit");

  // Summary counts
  const totalUnits = contextFiltered.length;
  const occupied = contextFiltered.filter((u) => u.status === "Occupied").length;
  const vacant = contextFiltered.filter((u) => u.status === "Vacant").length;
  const maintenance = contextFiltered.filter((u) => u.status === "Maintenance").length;
  const activeSummaryLabel = statusFilter ? `${statusFilter} units` : "All units";
  const emptyStateMessage = statusFilter
    ? `No ${statusFilter.toLowerCase()} units found.`
    : "No units match these filters.";

  function unitsHref(nextStatus: OccupancyStatus | "") {
    const params = new URLSearchParams();

    if (propertyFilter) params.set("property", propertyFilter);
    if (normalizedSearch) params.set("q", searchQuery.trim());
    if (nextStatus) params.set("status", nextStatus);
    if (sortBy !== "unit") params.set("sort", sortBy);

    const queryString = params.toString();
    return queryString ? `/units?${queryString}` : "/units";
  }

  const summaryCardBase =
    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const activeSummaryCard = "border-foreground bg-foreground text-background shadow-md";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        summary={
          hasActiveFilters ? (
            <>Showing <span className="font-medium text-foreground">{filtered.length}</span> of {units.length} units</>
          ) : activeProperty ? (
            <>Showing units for <span className="font-medium text-foreground">{activeProperty.name}</span></>
          ) : (
            `All ${units.length} units across ${properties.length} properties`
          )
        }
        action={
          hasActiveFilters ? (
          <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Link href="/units">
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Link>
          </Button>
          ) : null
        }
      />

      {/* Summary chips */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">
          <Link
            href={unitsHref("")}
            aria-current={!statusFilter ? "page" : undefined}
            className={cn(
              summaryCardBase,
              !statusFilter
                ? activeSummaryCard
                : "border-border bg-card text-foreground"
            )}
          >
            <span className="font-bold">{totalUnits}</span>
            <span className={cn(!statusFilter ? "text-background" : "text-muted-foreground")}>
              Total Units
            </span>
          </Link>
          <Link
            href={unitsHref("Occupied")}
            aria-current={statusFilter === "Occupied" ? "page" : undefined}
            className={cn(
              summaryCardBase,
              statusFilter === "Occupied"
                ? activeSummaryCard
                : semanticTone.success.surface
            )}
          >
            <span
              className={cn(
                "font-bold",
                statusFilter === "Occupied" ? "text-background" : semanticTone.success.text
              )}
            >
              {occupied}
            </span>
            <span
              className={cn(
                statusFilter === "Occupied"
                  ? "text-background"
                  : semanticTone.success.textSoft
              )}
            >
              Occupied
            </span>
          </Link>
          <Link
            href={unitsHref("Vacant")}
            aria-current={statusFilter === "Vacant" ? "page" : undefined}
            className={cn(
              summaryCardBase,
              statusFilter === "Vacant"
                ? activeSummaryCard
                : semanticTone.neutral.surface
            )}
          >
            <span
              className={cn(
                "font-bold",
                statusFilter === "Vacant" ? "text-background" : semanticTone.neutral.text
              )}
            >
              {vacant}
            </span>
            <span
              className={cn(
                statusFilter === "Vacant" ? "text-background" : semanticTone.neutral.textSoft
              )}
            >
              Vacant
            </span>
          </Link>
        {maintenance > 0 && (
          <Link
            href={unitsHref("Maintenance")}
            aria-current={statusFilter === "Maintenance" ? "page" : undefined}
            className={cn(
              summaryCardBase,
              statusFilter === "Maintenance"
                ? activeSummaryCard
                : semanticTone.maintenance.surface
            )}
          >
            <span
              className={cn(
                "font-bold",
                statusFilter === "Maintenance"
                  ? "text-background"
                  : semanticTone.maintenance.text
              )}
            >
              {maintenance}
            </span>
            <span
              className={cn(
                statusFilter === "Maintenance"
                  ? "text-background"
                  : semanticTone.maintenance.textSoft
              )}
            >
              Maintenance
            </span>
          </Link>
        )}
        </div>
        <p className="text-sm text-muted-foreground">
          Showing: <span className="font-medium text-foreground">{activeSummaryLabel}</span>
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <form action="/units" className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_minmax(12rem,16rem)_minmax(10rem,12rem)_minmax(10rem,12rem)_auto]">
            <div className="relative">
              <label htmlFor="unit-search" className="sr-only">
                Search units
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="unit-search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search unit, tenant, or property"
                className="pl-9"
              />
            </div>
            <div>
              <label htmlFor="property-filter" className="sr-only">
                Property
              </label>
              <select
                id="property-filter"
                name="property"
                defaultValue={propertyFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-card"
              >
                <option value="">All properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Status
              </label>
              <select
                id="status-filter"
                name="status"
                defaultValue={statusFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-card"
              >
                <option value="">All statuses</option>
                {occupancyStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sort-filter" className="sr-only">
                Sort units
              </label>
              <select
                id="sort-filter"
                name="sort"
                defaultValue={sortBy}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-card"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full lg:w-auto">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

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
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Rent / mo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((u) => {
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold">#{u.unitNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.propertyName}
                    </TableCell>
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
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {emptyStateMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

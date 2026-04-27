import type { RentStatus } from "@/types";
import { createClient } from "@/lib/supabase/server";

type UnitStatus = "Occupied" | "Vacant" | "Maintenance";

type UnitRow = {
  id: string;
  property_id: string;
  unit_number: string;
  rent: number | string;
  status: UnitStatus;
  tenant_name: string | null;
  created_at: string;
  properties?: { name: string } | { name: string }[] | null;
};

type TenantRow = {
  id: string;
  name: string;
  property_id: string;
  unit_id: string;
  lease_start: string;
  lease_end: string;
  rent_status: RentStatus;
  created_at: string;
  properties?: { name: string } | { name: string }[] | null;
  units?: { unit_number: string; rent: number | string } | { unit_number: string; rent: number | string }[] | null;
};

export type DashboardActivity = {
  id: string;
  label: string;
  detail: string;
  date: string;
  tone: "blue" | "green" | "amber";
};

export type DashboardStats = {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  tenantCount: number;
  monthlyIncome: number;
  overdueRent: number;
  occupancyRate: number;
  chartData: { month: string; revenue: number }[];
  upcomingLeaseExpiries: {
    id: string;
    name: string;
    propertyName: string;
    unitNumber: string;
    leaseEnd: string;
  }[];
  recentActivity: DashboardActivity[];
};

function relationValue<T>(relation: T | T[] | null | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function monthLabels() {
  const formatter = new Intl.DateTimeFormat("en-MY", { month: "short" });
  const currentMonth = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - index), 1);
    return formatter.format(date);
  });
}

function daysUntil(dateStr: string) {
  const today = new Date();
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const [
    propertiesResult,
    unitsResult,
    tenantsResult,
    recentTenantsResult,
    recentUnitsResult,
  ] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("units")
      .select("id, property_id, unit_number, rent, status, tenant_name, created_at, properties ( name )"),
    supabase
      .from("tenants")
      .select(
        "id, name, property_id, unit_id, lease_start, lease_end, rent_status, created_at, properties ( name ), units ( unit_number, rent )"
      ),
    supabase
      .from("tenants")
      .select("id, name, created_at, properties ( name ), units ( unit_number )")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("units")
      .select("id, unit_number, status, created_at, properties ( name )")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const error =
    propertiesResult.error ??
    unitsResult.error ??
    tenantsResult.error ??
    recentTenantsResult.error ??
    recentUnitsResult.error;

  if (error) {
    throw error;
  }

  const units = (unitsResult.data ?? []) as UnitRow[];
  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const totalUnits = units.length;
  const occupiedUnits = units.filter((unit) => unit.status === "Occupied").length;
  const vacantUnits = units.filter((unit) => unit.status === "Vacant").length;
  const monthlyIncome = units.reduce((sum, unit) => sum + Number(unit.rent), 0);
  const overdueRent = tenants
    .filter((tenant) => tenant.rent_status === "Overdue")
    .reduce((sum, tenant) => sum + Number(relationValue(tenant.units)?.rent ?? 0), 0);

  const upcomingLeaseExpiries = tenants
    .filter((tenant) => {
      const daysLeft = daysUntil(tenant.lease_end);
      return daysLeft >= 0 && daysLeft <= 120;
    })
    .sort((a, b) => new Date(a.lease_end).getTime() - new Date(b.lease_end).getTime())
    .slice(0, 5)
    .map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      propertyName: relationValue(tenant.properties)?.name ?? "Unknown property",
      unitNumber: relationValue(tenant.units)?.unit_number ?? "Unknown unit",
      leaseEnd: tenant.lease_end,
    }));

  const recentTenantActivities: DashboardActivity[] = (
    (recentTenantsResult.data ?? []) as TenantRow[]
  ).map((tenant) => ({
    id: `tenant-${tenant.id}`,
    label: "Tenant added",
    detail: `${tenant.name} assigned to ${relationValue(tenant.properties)?.name ?? "Unknown property"} · Unit ${
      relationValue(tenant.units)?.unit_number ?? "Unknown unit"
    }`,
    date: tenant.created_at,
    tone: "green",
  }));

  const recentUnitActivities: DashboardActivity[] = (
    (recentUnitsResult.data ?? []) as UnitRow[]
  ).map((unit) => ({
    id: `unit-${unit.id}`,
    label: "Unit created",
    detail: `${relationValue(unit.properties)?.name ?? "Unknown property"} · Unit ${unit.unit_number}`,
    date: unit.created_at,
    tone: unit.status === "Maintenance" ? "amber" : "blue",
  }));

  const recentActivity = [...recentTenantActivities, ...recentUnitActivities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return {
    totalProperties: propertiesResult.count ?? 0,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    tenantCount: tenants.length,
    monthlyIncome,
    overdueRent,
    occupancyRate: totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100),
    chartData: monthLabels().map((month) => ({ month, revenue: monthlyIncome })),
    upcomingLeaseExpiries,
    recentActivity,
  };
}

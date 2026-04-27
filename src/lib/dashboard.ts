import type { RentStatus } from "@/types";
import {
  ensureCurrentMonthRentRecords,
  getRevenueChartData,
  isRentPaymentsSchemaMissing,
} from "@/lib/rent-payments";
import { createClient } from "@/lib/supabase/server";

type UnitStatus = "Occupied" | "Vacant" | "Maintenance";
type Relation<T> = T | T[] | null;

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

type RentRecordRow = {
  month_start: string;
  amount: number | string;
  status: RentStatus;
};

type PaymentRow = {
  id: string;
  amount: number | string;
  paid_on: string;
  approval_status: "Approved" | "Pending" | "Rejected";
  created_at: string;
  tenants?: Relation<{ name: string }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
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

function daysUntil(dateStr: string) {
  const today = new Date();
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureCurrentMonthRentRecords();
  const supabase = await createClient();
  const [
    propertiesResult,
    unitsResult,
    tenantsResult,
    rentRecordsResult,
    recentPaymentsResult,
    recentTenantsResult,
    recentUnitsResult,
    chartData,
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
      .from("rent_records")
      .select("month_start, amount, status"),
    supabase
      .from("payments")
      .select("id, amount, paid_on, approval_status, created_at, tenants ( name ), properties ( name ), units ( unit_number )")
      .order("created_at", { ascending: false })
      .limit(4),
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
    getRevenueChartData(),
  ]);

  const error =
    propertiesResult.error ??
    unitsResult.error ??
    tenantsResult.error ??
    (rentRecordsResult.error && !isRentPaymentsSchemaMissing(rentRecordsResult.error)
      ? rentRecordsResult.error
      : null) ??
    (recentPaymentsResult.error && !isRentPaymentsSchemaMissing(recentPaymentsResult.error)
      ? recentPaymentsResult.error
      : null) ??
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
  const currentMonth = new Date().toISOString().slice(0, 7);
  const rentRecords = rentRecordsResult.error
    ? []
    : ((rentRecordsResult.data ?? []) as RentRecordRow[]);
  const currentMonthRecords = rentRecords.filter((record) =>
    record.month_start.startsWith(currentMonth)
  );
  const monthlyIncome =
    currentMonthRecords.length > 0
      ? currentMonthRecords.reduce((sum, record) => sum + Number(record.amount), 0)
      : units.reduce((sum, unit) => sum + Number(unit.rent), 0);
  const overdueRent = rentRecords
    .filter((record) => record.status === "Overdue")
    .reduce((sum, record) => sum + Number(record.amount), 0);

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

  const recentPaymentActivities: DashboardActivity[] = (
    recentPaymentsResult.error ? [] : ((recentPaymentsResult.data ?? []) as PaymentRow[])
  ).map((payment) => ({
    id: `payment-${payment.id}`,
    label: `Payment ${payment.approval_status.toLowerCase()}`,
    detail: `${relationValue(payment.tenants)?.name ?? "Unknown tenant"} · ${
      relationValue(payment.properties)?.name ?? "Unknown property"
    } · Unit ${relationValue(payment.units)?.unit_number ?? "Unknown unit"}`,
    date: payment.created_at,
    tone:
      payment.approval_status === "Approved"
        ? "green"
        : payment.approval_status === "Rejected"
        ? "amber"
        : "blue",
  }));

  const recentActivity = [...recentPaymentActivities, ...recentTenantActivities, ...recentUnitActivities]
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
    chartData,
    upcomingLeaseExpiries,
    recentActivity,
  };
}

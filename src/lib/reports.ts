import type { OccupancyStatus, RentStatus } from "@/types";
import {
  ensureCurrentMonthRentRecords,
  isRentPaymentsSchemaMissing,
} from "@/lib/rent-payments";
import { createClient } from "@/lib/supabase/server";

type UnitRow = {
  id: string;
  rent: number | string;
  status: OccupancyStatus;
};

type PropertyRow = {
  id: string;
  name: string;
  location: string;
  units?: UnitRow[] | null;
};

type TenantRow = {
  unit_id: string;
  lease_start: string;
  lease_end: string;
};

type RentRecordRow = {
  property_id: string;
  month_start: string;
  amount: number | string;
  status: RentStatus;
};

export type ReportChartPoint = {
  month: string;
  revenue: number;
};

export type OccupancyChartPoint = {
  month: string;
  rate: number;
};

export type PropertyReportStats = {
  id: string;
  name: string;
  location: string;
  unitCount: number;
  occupiedCount: number;
  occupancy: number;
  monthlyIncome: number;
  collected: number;
  overdueCount: number;
};

export type ReportsStats = {
  totalCollected: number;
  totalOverdue: number;
  totalExpected: number;
  collectionRate: number;
  avgOccupancy: number;
  overdueCount: number;
  pendingCount: number;
  propStats: PropertyReportStats[];
  best: PropertyReportStats | null;
  revenueChart: ReportChartPoint[];
  occupancyChart: OccupancyChartPoint[];
  rangeLabel: string;
};

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-MY", { month: "short" }).format(date);
}

function formatRangeMonth(date: Date) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function toDateInput(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function buildMonthRange(count = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - count + 1, 1);

  return Array.from({ length: count }, (_, index) => {
    const monthStart = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );

    return {
      key: toDateInput(monthStart),
      label: formatMonth(monthStart),
      start: monthStart,
      end: monthEnd,
    };
  });
}

function isLeaseActiveForMonth(tenant: TenantRow, monthStart: Date, monthEnd: Date) {
  const leaseStart = new Date(`${tenant.lease_start}T00:00:00`);
  const leaseEnd = new Date(`${tenant.lease_end}T00:00:00`);

  return leaseStart <= monthEnd && leaseEnd >= monthStart;
}

export async function getReportsStats(): Promise<ReportsStats> {
  await ensureCurrentMonthRentRecords();

  const supabase = await createClient();
  const [propertiesResult, tenantsResult, rentRecordsResult] = await Promise.all([
    supabase
      .from("properties")
      .select("id, name, location, units ( id, rent, status )")
      .order("created_at", { ascending: false }),
    supabase.from("tenants").select("unit_id, lease_start, lease_end"),
    supabase
      .from("rent_records")
      .select("property_id, month_start, amount, status"),
  ]);

  const error =
    propertiesResult.error ??
    tenantsResult.error ??
    (rentRecordsResult.error && !isRentPaymentsSchemaMissing(rentRecordsResult.error)
      ? rentRecordsResult.error
      : null);

  if (error) {
    throw error;
  }

  const properties = (propertiesResult.data ?? []) as PropertyRow[];
  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const rentRecords = rentRecordsResult.error
    ? []
    : ((rentRecordsResult.data ?? []) as RentRecordRow[]);

  const allUnits = properties.flatMap((property) => property.units ?? []);
  const totalUnits = allUnits.length;
  const occupiedUnits = allUnits.filter((unit) => unit.status === "Occupied").length;
  const paid = rentRecords.filter((record) => record.status === "Paid");
  const overdue = rentRecords.filter((record) => record.status === "Overdue");
  const pending = rentRecords.filter((record) => record.status === "Pending");

  const totalCollected = paid.reduce(
    (sum, record) => sum + Number(record.amount),
    0
  );
  const totalOverdue = overdue.reduce(
    (sum, record) => sum + Number(record.amount),
    0
  );
  const totalExpected = rentRecords.reduce(
    (sum, record) => sum + Number(record.amount),
    0
  );

  const propStats = properties.map((property) => {
    const units = property.units ?? [];
    const propertyRecords = rentRecords.filter(
      (record) => record.property_id === property.id
    );
    const unitCount = units.length;
    const occupiedCount = units.filter((unit) => unit.status === "Occupied").length;
    const monthlyIncome = units.reduce((sum, unit) => sum + Number(unit.rent), 0);
    const collected = propertyRecords
      .filter((record) => record.status === "Paid")
      .reduce((sum, record) => sum + Number(record.amount), 0);
    const overdueCount = propertyRecords.filter(
      (record) => record.status === "Overdue"
    ).length;

    return {
      id: property.id,
      name: property.name,
      location: property.location,
      unitCount,
      occupiedCount,
      occupancy: unitCount === 0 ? 0 : Math.round((occupiedCount / unitCount) * 100),
      monthlyIncome,
      collected,
      overdueCount,
    };
  });

  const months = buildMonthRange();
  const revenueChart = months.map((month) => ({
    month: month.label,
    revenue: rentRecords
      .filter(
        (record) =>
          record.month_start === month.key && record.status === "Paid"
      )
      .reduce((sum, record) => sum + Number(record.amount), 0),
  }));

  const occupancyChart = months.map((month) => {
    const activeUnitIds = new Set(
      tenants
        .filter((tenant) => isLeaseActiveForMonth(tenant, month.start, month.end))
        .map((tenant) => tenant.unit_id)
    );

    return {
      month: month.label,
      rate: totalUnits === 0 ? 0 : Math.round((activeUnitIds.size / totalUnits) * 100),
    };
  });

  const best =
    propStats.length === 0
      ? null
      : [...propStats].sort((a, b) => b.monthlyIncome - a.monthlyIncome)[0];

  return {
    totalCollected,
    totalOverdue,
    totalExpected,
    collectionRate:
      totalExpected === 0 ? 0 : Math.round((totalCollected / totalExpected) * 100),
    avgOccupancy: totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100),
    overdueCount: overdue.length,
    pendingCount: pending.length,
    propStats,
    best,
    revenueChart,
    occupancyChart,
    rangeLabel: `${formatRangeMonth(months[0].start)} - ${formatRangeMonth(
      months[months.length - 1].start
    )}`,
  };
}

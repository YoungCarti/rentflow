"use client";

import type {
  MaintenanceStatus,
  PaymentApprovalStatus,
  PaymentMethod,
  RentStatus,
} from "@/types";
import { createClient } from "@/lib/supabase/client";
import { getActiveRentRecords } from "@/lib/rent-reminders";

type Relation<T> = T | T[] | null;

export type NotificationType =
  | "payment_pending"
  | "lease_ending"
  | "rent_overdue"
  | "maintenance_update";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  href: string;
  date: string;
  severity: "info" | "warning" | "danger" | "success";
};

type PaymentRow = {
  id: string;
  amount: number | string;
  paid_on: string;
  approval_status: PaymentApprovalStatus;
  tenants?: Relation<{ name: string }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

type TenantRow = {
  id: string;
  name: string;
  lease_end: string;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

type RentRecordRow = {
  id: string;
  tenant_id: string;
  month_start: string;
  amount: number | string;
  due_date: string;
  status: RentStatus;
  payment_method: PaymentMethod | null;
  tenants?: Relation<{ name: string; email?: string | null; phone?: string | null; payment_link_id?: string | null }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

type MaintenanceRow = {
  id: string;
  title: string;
  status: MaintenanceStatus;
  reported_on: string;
  resolved_on: string | null;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

type SupabaseQueryError = {
  code?: string;
  message?: string;
};

function relationValue<T>(relation: Relation<T> | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function isMissingTable(error: unknown, tableName: string) {
  const queryError = error as SupabaseQueryError;
  const message = queryError.message ?? "";

  return (
    queryError.code === "42P01" ||
    (queryError.code === "PGRST205" && message.includes(tableName))
  );
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function formatMonth(monthStart: string) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthStart}T00:00:00`));
}

function daysUntil(dateStr: string) {
  const today = new Date();
  const target = new Date(`${dateStr}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

async function getPendingPaymentNotifications() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, paid_on, approval_status, tenants ( name ), properties ( name ), units ( unit_number )")
    .eq("approval_status", "Pending")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    if (isMissingTable(error, "payments")) return [];
    throw error;
  }

  return ((data ?? []) as PaymentRow[]).map((payment): AppNotification => {
    const tenantName = relationValue(payment.tenants)?.name ?? "Unknown tenant";
    const propertyName = relationValue(payment.properties)?.name ?? "Unknown property";
    const unitNumber = relationValue(payment.units)?.unit_number ?? "Unknown unit";

    return {
      id: `payment-${payment.id}`,
      type: "payment_pending",
      title: `${tenantName} payment pending`,
      description: `${formatRM(Number(payment.amount))} · ${propertyName} · Unit ${unitNumber}`,
      href: "/payments",
      date: payment.paid_on,
      severity: "warning",
    };
  });
}

async function getLeaseEndingNotifications() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date();
  end.setDate(end.getDate() + 60);

  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, lease_end, properties ( name ), units ( unit_number )")
    .gte("lease_end", today)
    .lte("lease_end", end.toISOString().slice(0, 10))
    .order("lease_end", { ascending: true })
    .limit(8);

  if (error) {
    if (isMissingTable(error, "tenants")) return [];
    throw error;
  }

  return ((data ?? []) as TenantRow[]).map((tenant): AppNotification => {
    const propertyName = relationValue(tenant.properties)?.name ?? "Unknown property";
    const unitNumber = relationValue(tenant.units)?.unit_number ?? "Unknown unit";
    const days = daysUntil(tenant.lease_end);

    return {
      id: `lease-${tenant.id}`,
      type: "lease_ending",
      title: `${tenant.name} lease ending soon`,
      description: `${propertyName} · Unit ${unitNumber} · ${days} day${days === 1 ? "" : "s"} left`,
      href: `/tenants/${tenant.id}`,
      date: tenant.lease_end,
      severity: days <= 14 ? "danger" : "warning",
    };
  });
}

async function getRentOverdueNotifications() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rent_records")
    .select(
      "id, tenant_id, month_start, amount, due_date, status, payment_method, tenants ( name, email, phone, payment_link_id ), properties ( name ), units ( unit_number )"
    )
    .eq("status", "Overdue")
    .order("due_date", { ascending: true })
    .limit(20);

  if (error) {
    if (isMissingTable(error, "rent_records")) return [];
    throw error;
  }

  const rentRecords = ((data ?? []) as RentRecordRow[]).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: relationValue(row.tenants)?.name ?? "Unknown tenant",
    tenantEmail: relationValue(row.tenants)?.email ?? undefined,
    tenantPhone: relationValue(row.tenants)?.phone ?? undefined,
    paymentLinkId: relationValue(row.tenants)?.payment_link_id ?? undefined,
    propertyName: relationValue(row.properties)?.name ?? "Unknown property",
    unitNumber: relationValue(row.units)?.unit_number ?? "Unknown unit",
    month: formatMonth(row.month_start),
    monthStart: row.month_start,
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
    paymentMethod: row.payment_method,
  }));

  return getActiveRentRecords(rentRecords).slice(0, 8).map((record): AppNotification => ({
    id: `rent-${record.id}`,
    type: "rent_overdue",
    title: `${record.tenantName} rent overdue`,
    description: `${formatRM(record.amount)} · ${record.propertyName} · Unit ${record.unitNumber}`,
    href: "/rent",
    date: record.dueDate,
    severity: "danger",
  }));
}

async function getMaintenanceNotifications() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select("id, title, status, reported_on, resolved_on, properties ( name ), units ( unit_number )")
    .in("status", ["Open", "In Progress"])
    .order("reported_on", { ascending: false })
    .limit(8);

  if (error) {
    if (isMissingTable(error, "maintenance_requests")) return [];
    throw error;
  }

  return ((data ?? []) as MaintenanceRow[]).map((request): AppNotification => {
    const propertyName = relationValue(request.properties)?.name ?? "Unknown property";
    const unitNumber = relationValue(request.units)?.unit_number;

    return {
      id: `maintenance-${request.id}-${request.status}`,
      type: "maintenance_update",
      title: request.title,
      description: `${request.status} · ${propertyName}${unitNumber ? ` · Unit ${unitNumber}` : ""}`,
      href: "/maintenance",
      date: request.reported_on,
      severity: request.status === "Open" ? "warning" : "info",
    };
  });
}

export async function getNotifications() {
  const groups = await Promise.all([
    getPendingPaymentNotifications(),
    getLeaseEndingNotifications(),
    getRentOverdueNotifications(),
    getMaintenanceNotifications(),
  ]);

  return groups
    .flat()
    .sort((a, b) => {
      const severityOrder = { danger: 0, warning: 1, info: 2, success: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];

      if (severityDiff !== 0) return severityDiff;
      return a.date.localeCompare(b.date);
    });
}

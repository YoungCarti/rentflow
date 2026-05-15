import type { Payment, PaymentApprovalStatus, PaymentMethod, RentRecord, RentStatus } from "@/types";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null;

type RentRecordRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  month_start: string;
  amount: number | string;
  due_date: string;
  status: RentStatus;
  payment_method: PaymentMethod | null;
  tenants?: Relation<{
    name: string;
    email?: string | null;
    phone?: string | null;
    payment_link_id?: string | null;
  }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

type PaymentRow = {
  id: string;
  rent_record_id: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  amount: number | string;
  paid_on: string;
  method: PaymentMethod;
  approval_status: PaymentApprovalStatus;
  proof_url: string | null;
  tenants?: Relation<{ name: string }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

type TenantRentSeedRow = {
  id: string;
  property_id: string;
  unit_id: string;
  lease_start: string;
  lease_end: string;
  units?: Relation<{ rent: number | string }>;
};

type SupabaseQueryError = {
  code?: string;
  message?: string;
};

const rentRecordSelect =
  "id, tenant_id, property_id, unit_id, month_start, amount, due_date, status, payment_method, tenants ( name, email, phone, payment_link_id ), properties ( name ), units ( unit_number )";

const paymentSelect =
  "id, rent_record_id, tenant_id, property_id, unit_id, amount, paid_on, method, approval_status, proof_url, tenants ( name ), properties ( name ), units ( unit_number )";

function relationValue<T>(relation: Relation<T> | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dueDateForMonth(leaseStart: string, month: Date) {
  const leaseStartDate = new Date(leaseStart);
  const dueDay = leaseStartDate.getDate();
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  return new Date(year, monthIndex, Math.min(dueDay, lastDay));
}

function formatMonth(monthStartDate: string) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthStartDate}T00:00:00`));
}

function toRentRecord(row: RentRecordRow): RentRecord {
  return {
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
  };
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    rentRecordId: row.rent_record_id,
    tenantId: row.tenant_id,
    tenantName: relationValue(row.tenants)?.name ?? "Unknown tenant",
    propertyName: relationValue(row.properties)?.name ?? "Unknown property",
    unitNumber: relationValue(row.units)?.unit_number ?? "Unknown unit",
    amount: Number(row.amount),
    date: row.paid_on,
    method: row.method,
    status:
      row.method === "Online" && row.approval_status === "Pending"
        ? "Approved"
        : row.approval_status,
    proofUrl: row.proof_url ?? undefined,
  };
}

async function approvePendingOnlinePayments(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  rows: PaymentRow[]
) {
  const pendingOnlinePaymentIds = rows
    .filter(
      (row) => row.method === "Online" && row.approval_status === "Pending"
    )
    .map((row) => row.id);
  const pendingOnlinePaymentIdSet = new Set(pendingOnlinePaymentIds);

  if (pendingOnlinePaymentIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("payments")
    .update({ approval_status: "Approved" })
    .in("id", pendingOnlinePaymentIds);

  if (error) {
    console.error("Unable to auto-approve online payments", error);
    return;
  }

  for (const row of rows) {
    if (pendingOnlinePaymentIdSet.has(row.id)) {
      row.approval_status = "Approved";
    }
  }
}

export function isRentPaymentsSchemaMissing(error: unknown) {
  const queryError = error as SupabaseQueryError;
  const message = queryError.message ?? "";

  return (
    queryError.code === "42P01" ||
    (queryError.code === "PGRST205" &&
      (message.includes("rent_records") || message.includes("payments")))
  );
}

function emptyRevenueChartData() {
  const start = new Date();
  start.setMonth(start.getMonth() - 5, 1);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      month: new Intl.DateTimeFormat("en-MY", { month: "short" }).format(date),
      revenue: 0,
    };
  });
}

async function ensureCurrentMonthRentRecordsWithClient(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
) {
  const currentMonth = monthStart();
  const monthStartInput = toDateInput(currentMonth);
  const todayInput = toDateInput(new Date());

  const refreshOverduePendingRecords = async () => {
    const { error } = await supabase
      .from("rent_records")
      .update({ status: "Overdue" })
      .eq("status", "Pending")
      .lt("due_date", todayInput);

    if (error) {
      if (isRentPaymentsSchemaMissing(error)) {
        return;
      }

      throw error;
    }
  };

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, property_id, unit_id, lease_start, lease_end, units ( rent )")
    .lte("lease_start", todayInput)
    .gte("lease_end", todayInput);

  if (error) {
    throw error;
  }

  const rows = ((tenants ?? []) as TenantRentSeedRow[]).map((tenant) => {
    const dueDate = dueDateForMonth(tenant.lease_start, currentMonth);
    const dueDateInput = toDateInput(dueDate);

    return {
      tenant_id: tenant.id,
      property_id: tenant.property_id,
      unit_id: tenant.unit_id,
      month_start: monthStartInput,
      amount: Number(relationValue(tenant.units)?.rent ?? 0),
      due_date: dueDateInput,
      status: dueDateInput < todayInput ? "Overdue" : "Pending",
    };
  });

  if (rows.length === 0) {
    await refreshOverduePendingRecords();
    return;
  }

  const { error: upsertError } = await supabase
    .from("rent_records")
    .upsert(rows, { onConflict: "tenant_id,month_start", ignoreDuplicates: true });

  if (upsertError) {
    if (isRentPaymentsSchemaMissing(upsertError)) {
      return;
    }

    throw upsertError;
  }

  await refreshOverduePendingRecords();
}

export async function ensureCurrentMonthRentRecords() {
  const supabase = await createServerSupabaseClient();
  await ensureCurrentMonthRentRecordsWithClient(supabase);
}

export async function getRentRecords() {
  const supabase = await createServerSupabaseClient();
  await ensureCurrentMonthRentRecordsWithClient(supabase);

  const { data, error } = await supabase
    .from("rent_records")
    .select(rentRecordSelect)
    .order("month_start", { ascending: false })
    .order("due_date", { ascending: true });

  if (error) {
    if (isRentPaymentsSchemaMissing(error)) {
      return [];
    }

    throw error;
  }

  return (data ?? []).map((row) => toRentRecord(row as RentRecordRow));
}

export async function getPayments() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .order("created_at", { ascending: false });

  if (error) {
    if (isRentPaymentsSchemaMissing(error)) {
      return [];
    }

    throw error;
  }

  const paymentRows = (data ?? []) as PaymentRow[];
  await approvePendingOnlinePayments(supabase, paymentRows);

  return paymentRows.map((row) => toPayment(row));
}

export async function getRevenueChartData() {
  const supabase = await createServerSupabaseClient();
  await ensureCurrentMonthRentRecordsWithClient(supabase);

  const start = new Date();
  start.setMonth(start.getMonth() - 5, 1);

  const { data, error } = await supabase
    .from("rent_records")
    .select("month_start, amount, status")
    .gte("month_start", toDateInput(start));

  if (error) {
    if (isRentPaymentsSchemaMissing(error)) {
      return emptyRevenueChartData();
    }

    throw error;
  }

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const key = toDateInput(date);
    return {
      key,
      month: new Intl.DateTimeFormat("en-MY", { month: "short" }).format(date),
      revenue: 0,
    };
  });

  for (const row of (data ?? []) as Array<{ month_start: string; amount: number | string; status: RentStatus }>) {
    if (row.status !== "Paid") continue;
    const month = months.find((item) => item.key === row.month_start);
    if (month) {
      month.revenue += Number(row.amount);
    }
  }

  return months.map(({ month, revenue }) => ({ month, revenue }));
}

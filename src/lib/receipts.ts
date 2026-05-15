import type { PaymentMethod } from "@/types";
import { createClient } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null;

export type PaymentReceipt = {
  paymentId: string;
  receiptNumber: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  paidOn: string;
  method: PaymentMethod;
  monthStart: string;
  dueDate: string;
};

type PaymentReceiptRow = {
  id: string;
  amount: number | string;
  paid_on: string;
  method: PaymentMethod;
  approval_status: string;
  tenants?: Relation<{ name: string }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
  rent_records?: Relation<{ month_start: string; due_date: string }>;
};

type PublicPaymentReceiptRow = {
  payment_id: string;
  tenant_name: string;
  property_name: string;
  unit_number: string;
  amount: number | string;
  paid_on: string;
  method: PaymentMethod;
  month_start: string;
  due_date: string;
};

const paymentReceiptSelect =
  "id, amount, paid_on, method, approval_status, tenants ( name ), properties ( name ), units ( unit_number ), rent_records ( month_start, due_date )";

function relationValue<T>(relation: Relation<T> | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function receiptNumber(paymentId: string, paidOn: string) {
  const year = new Date(`${paidOn}T00:00:00`).getFullYear();
  return `RF-${year}-${paymentId.slice(0, 8).toUpperCase()}`;
}

function toReceipt(row: PaymentReceiptRow): PaymentReceipt {
  const rentRecord = relationValue(row.rent_records);

  return {
    paymentId: row.id,
    receiptNumber: receiptNumber(row.id, row.paid_on),
    tenantName: relationValue(row.tenants)?.name ?? "Unknown tenant",
    propertyName: relationValue(row.properties)?.name ?? "Unknown property",
    unitNumber: relationValue(row.units)?.unit_number ?? "Unknown unit",
    amount: Number(row.amount),
    paidOn: row.paid_on,
    method: row.method,
    monthStart: rentRecord?.month_start ?? row.paid_on,
    dueDate: rentRecord?.due_date ?? row.paid_on,
  };
}

function toPublicReceipt(row: PublicPaymentReceiptRow): PaymentReceipt {
  return {
    paymentId: row.payment_id,
    receiptNumber: receiptNumber(row.payment_id, row.paid_on),
    tenantName: row.tenant_name,
    propertyName: row.property_name,
    unitNumber: row.unit_number,
    amount: Number(row.amount),
    paidOn: row.paid_on,
    method: row.method,
    monthStart: row.month_start,
    dueDate: row.due_date,
  };
}

export async function getPaymentReceipt(paymentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(paymentReceiptSelect)
    .eq("id", paymentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw error;
  }

  const row = data as PaymentReceiptRow;
  const approvedReceipt = row.approval_status === "Approved";
  const onlineAutoApprovedReceipt =
    row.method === "Online" &&
    (row.approval_status === "Pending" || row.approval_status === "Approved");

  if (!approvedReceipt && !onlineAutoApprovedReceipt) {
    return null;
  }

  return toReceipt(row);
}

export async function getPublicPaymentReceipt(paymentLinkId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_rent_receipt", {
    link_id: paymentLinkId,
  });

  if (error) {
    throw error;
  }

  const row = data?.[0] as PublicPaymentReceiptRow | undefined;
  return row ? toPublicReceipt(row) : null;
}

import type { RentStatus } from "@/types";
import { createClient } from "@/lib/supabase/server";

export type PublicRentPayment = {
  paymentLinkId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  status: RentStatus;
  paidOn: string | null;
  monthStart: string;
};

type PublicRentPaymentRow = {
  payment_link_id: string;
  tenant_name: string;
  property_name: string;
  unit_number: string;
  amount: number | string;
  due_date: string;
  status: RentStatus;
  paid_on: string | null;
  month_start: string;
};

function toPublicRentPayment(row: PublicRentPaymentRow): PublicRentPayment {
  return {
    paymentLinkId: row.payment_link_id,
    tenantName: row.tenant_name,
    propertyName: row.property_name,
    unitNumber: row.unit_number,
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
    paidOn: row.paid_on,
    monthStart: row.month_start,
  };
}

export async function getPublicRentPayment(paymentLinkId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_rent_payment", {
    link_id: paymentLinkId,
  });

  if (error) {
    throw error;
  }

  const row = data?.[0] as PublicRentPaymentRow | undefined;
  return row ? toPublicRentPayment(row) : null;
}

export async function markPublicRentPaid(paymentLinkId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mark_public_rent_paid", {
    link_id: paymentLinkId,
  });

  if (error) {
    throw error;
  }

  const row = data?.[0] as PublicRentPaymentRow | undefined;
  return row ? toPublicRentPayment(row) : null;
}

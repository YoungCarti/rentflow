import type { Payment, PaymentApprovalStatus, PaymentMethod } from "@/types";
import { createClient } from "@/lib/supabase/client";

type Relation<T> = T | T[] | null;

type PaymentRow = {
  id: string;
  rent_record_id: string;
  tenant_id: string;
  amount: number | string;
  paid_on: string;
  method: PaymentMethod;
  approval_status: PaymentApprovalStatus;
  proof_url: string | null;
  tenants?: Relation<{ name: string }>;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

const paymentSelect =
  "id, rent_record_id, tenant_id, amount, paid_on, method, approval_status, proof_url, tenants ( name ), properties ( name ), units ( unit_number )";

const PAYMENT_PROOFS_BUCKET = "payment-proofs";

function relationValue<T>(relation: Relation<T> | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
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
    status: row.approval_status,
    proofUrl: row.proof_url ?? undefined,
  };
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function uploadPaymentProof(input: {
  rentRecordId: string;
  file: File;
}) {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const user = userData.user;

  if (!user) {
    throw new Error("You must be signed in to upload payment proof.");
  }

  const filePath = `${user.id}/${input.rentRecordId}/${crypto.randomUUID()}-${safeFileName(
    input.file.name
  )}`;
  const { error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(filePath, input.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return filePath;
}

export async function submitPayment(input: {
  rentRecordId: string;
  tenantId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  proofFile: File;
}) {
  const supabase = createClient();
  const proofPath = await uploadPaymentProof({
    rentRecordId: input.rentRecordId,
    file: input.proofFile,
  });
  const { data: rentRecord, error: rentRecordError } = await supabase
    .from("rent_records")
    .select("id, tenant_id, property_id, unit_id")
    .eq("id", input.rentRecordId)
    .single();

  if (rentRecordError) {
    throw rentRecordError;
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      rent_record_id: input.rentRecordId,
      tenant_id: input.tenantId,
      property_id: rentRecord.property_id,
      unit_id: rentRecord.unit_id,
      amount: input.amount,
      paid_on: input.date,
      method: input.method,
      approval_status: "Pending",
      proof_url: proofPath,
    })
    .select(paymentSelect)
    .single();

  if (error) {
    throw error;
  }

  return toPayment(data as PaymentRow);
}

export async function updatePaymentStatus(id: string, status: PaymentApprovalStatus) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .update({ approval_status: status })
    .eq("id", id)
    .select(paymentSelect)
    .single();

  if (error) {
    throw error;
  }

  return toPayment(data as PaymentRow);
}

export async function createPaymentProofSignedUrl(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .createSignedUrl(path, 60 * 10);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

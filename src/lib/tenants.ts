import type { RentStatus, Tenant } from "@/types";
import { createClient } from "@/lib/supabase/client";

type Relation<T> = T | T[] | null;

type TenantRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  payment_link_id?: string | null;
  property_id: string;
  unit_id: string;
  lease_start: string;
  lease_end: string;
  rent_status: RentStatus;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
};

export type TenantInput = {
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  unitId: string;
  leaseStart: string;
  leaseEnd: string;
  rentStatus: RentStatus;
};

function relationValue<T>(relation: Relation<T> | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function toTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    paymentLinkId: row.payment_link_id ?? undefined,
    propertyId: row.property_id,
    propertyName: relationValue(row.properties)?.name ?? "Unknown property",
    unitId: row.unit_id,
    unitNumber: relationValue(row.units)?.unit_number ?? "Unknown unit",
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    rentStatus: row.rent_status,
  };
}

function toTenantRow(input: TenantInput) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    property_id: input.propertyId,
    unit_id: input.unitId,
    lease_start: input.leaseStart,
    lease_end: input.leaseEnd,
    rent_status: input.rentStatus,
  };
}

const tenantSelect =
  "id, name, email, phone, payment_link_id, property_id, unit_id, lease_start, lease_end, rent_status, properties ( name ), units ( unit_number )";

export async function getTenants() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(tenantSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toTenant(row as TenantRow));
}

export async function getTenant(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(tenantSelect)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return toTenant(data as TenantRow);
}

export async function createTenant(input: TenantInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .insert(toTenantRow(input))
    .select(tenantSelect)
    .single();

  if (error) {
    throw error;
  }

  return toTenant(data as TenantRow);
}

export async function updateTenantRecord(id: string, input: TenantInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .update(toTenantRow(input))
    .eq("id", id)
    .select(tenantSelect)
    .single();

  if (error) {
    throw error;
  }

  return toTenant(data as TenantRow);
}

export async function deleteTenantRecord(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function regenerateTenantPaymentLink(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("regenerate_tenant_payment_link", {
    target_tenant_id: id,
  });

  if (!error && data && typeof data === "string") {
    return data;
  }

  const paymentLinkId = crypto.randomUUID().replaceAll("-", "");
  const { data: updatedTenant, error: updateError } = await supabase
    .from("tenants")
    .update({ payment_link_id: paymentLinkId })
    .eq("id", id)
    .select("payment_link_id")
    .single();

  if (updateError) {
    throw updateError;
  }

  if (!updatedTenant?.payment_link_id) {
    const message =
      error?.message ?? "Supabase did not return the regenerated payment link.";
    throw new Error(message);
  }

  return updatedTenant.payment_link_id as string;
}

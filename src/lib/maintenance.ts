import type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
} from "@/types";
import { createClient } from "@/lib/supabase/client";

type Relation<T> = T | T[] | null;

type MaintenanceRow = {
  id: string;
  property_id: string;
  unit_id: string | null;
  tenant_id: string | null;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reported_by: "Landlord" | "Tenant";
  reported_on: string;
  resolved_on: string | null;
  estimated_cost: number | string | null;
  actual_cost: number | string | null;
  vendor_name: string | null;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
  tenants?: Relation<{ name: string }>;
};

export type MaintenanceRequestInput = {
  propertyId: string;
  unitId?: string | null;
  tenantId?: string | null;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy: "Landlord" | "Tenant";
  reportedOn: string;
  estimatedCost: number;
  actualCost: number;
  vendorName?: string | null;
};

export type MaintenanceRequestUpdate = {
  status?: MaintenanceStatus;
  estimatedCost?: number;
  actualCost?: number;
  vendorName?: string | null;
};

const maintenanceSelect =
  "id, property_id, unit_id, tenant_id, title, description, category, priority, status, reported_by, reported_on, resolved_on, estimated_cost, actual_cost, vendor_name, properties ( name ), units ( unit_number ), tenants ( name )";

function relationValue<T>(relation: Relation<T> | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function toMaintenanceRequest(row: MaintenanceRow): MaintenanceRequest {
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyName: relationValue(row.properties)?.name ?? "Unknown property",
    unitId: row.unit_id,
    unitNumber: relationValue(row.units)?.unit_number ?? null,
    tenantId: row.tenant_id,
    tenantName: relationValue(row.tenants)?.name ?? null,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    reportedBy: row.reported_by,
    reportedOn: row.reported_on,
    resolvedOn: row.resolved_on,
    estimatedCost: Number(row.estimated_cost ?? 0),
    actualCost: Number(row.actual_cost ?? 0),
    vendorName: row.vendor_name,
  };
}

function toMaintenanceRow(input: MaintenanceRequestInput) {
  return {
    property_id: input.propertyId,
    unit_id: input.unitId || null,
    tenant_id: input.tenantId || null,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: input.status,
    reported_by: input.reportedBy,
    reported_on: input.reportedOn,
    resolved_on: input.status === "Resolved" ? new Date().toISOString().slice(0, 10) : null,
    estimated_cost: input.estimatedCost,
    actual_cost: input.actualCost,
    vendor_name: input.vendorName || null,
  };
}

function toMaintenanceUpdateRow(input: MaintenanceRequestUpdate) {
  const row: Record<string, string | number | null> = {};

  if (input.status) {
    row.status = input.status;
    row.resolved_on =
      input.status === "Resolved" ? new Date().toISOString().slice(0, 10) : null;
  }

  if (typeof input.estimatedCost === "number") {
    row.estimated_cost = input.estimatedCost;
  }

  if (typeof input.actualCost === "number") {
    row.actual_cost = input.actualCost;
  }

  if ("vendorName" in input) {
    row.vendor_name = input.vendorName || null;
  }

  return row;
}

export async function getMaintenanceRequests() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select(maintenanceSelect)
    .order("reported_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toMaintenanceRequest(row as MaintenanceRow));
}

export async function createMaintenanceRequest(input: MaintenanceRequestInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert(toMaintenanceRow(input))
    .select(maintenanceSelect)
    .single();

  if (error) {
    throw error;
  }

  return toMaintenanceRequest(data as MaintenanceRow);
}

export async function updateMaintenanceRequest(
  id: string,
  input: MaintenanceRequestUpdate
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .update(toMaintenanceUpdateRow(input))
    .eq("id", id)
    .select(maintenanceSelect)
    .single();

  if (error) {
    throw error;
  }

  return toMaintenanceRequest(data as MaintenanceRow);
}

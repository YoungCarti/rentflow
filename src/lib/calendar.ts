import type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  RentRecord,
  RentStatus,
  Tenant,
} from "@/types";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { getRentRecords } from "@/lib/rent-payments";

type Relation<T> = T | T[] | null;

export type CalendarEventType =
  | "rent_due"
  | "lease_expiry"
  | "inspection"
  | "maintenance";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  date: string;
  title: string;
  description: string;
  status?: RentStatus | MaintenanceStatus;
  amount?: number;
};

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

type MaintenanceRow = {
  id: string;
  title: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reported_on: string;
  resolved_on: string | null;
  properties?: Relation<{ name: string }>;
  units?: Relation<{ unit_number: string }>;
  tenants?: Relation<{ name: string }>;
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

function dateWithinMonth(date: string, monthStart: Date) {
  const value = new Date(`${date}T00:00:00`);

  return (
    value.getFullYear() === monthStart.getFullYear() &&
    value.getMonth() === monthStart.getMonth()
  );
}

function addDays(dateStr: string, days: number) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function rentEvent(record: RentRecord): CalendarEvent {
  return {
    id: `rent-${record.id}`,
    type: "rent_due",
    date: record.dueDate,
    title: `${record.tenantName} rent due`,
    description: `${record.propertyName} · Unit ${record.unitNumber} · ${record.month}`,
    status: record.status,
    amount: record.amount,
  };
}

function leaseExpiryEvent(tenant: Tenant): CalendarEvent {
  return {
    id: `lease-${tenant.id}`,
    type: "lease_expiry",
    date: tenant.leaseEnd,
    title: `${tenant.name} lease ends`,
    description: `${tenant.propertyName} · Unit ${tenant.unitNumber}`,
    status: tenant.rentStatus,
  };
}

function inspectionEvent(tenant: Tenant): CalendarEvent {
  return {
    id: `inspection-${tenant.id}`,
    type: "inspection",
    date: addDays(tenant.leaseEnd, -14),
    title: `${tenant.name} inspection`,
    description: `${tenant.propertyName} · Unit ${tenant.unitNumber}`,
  };
}

function maintenanceEvents(row: MaintenanceRow): CalendarEvent[] {
  const propertyName = relationValue(row.properties)?.name ?? "Unknown property";
  const unitNumber = relationValue(row.units)?.unit_number;
  const tenantName = relationValue(row.tenants)?.name;
  const location = [
    propertyName,
    unitNumber ? `Unit ${unitNumber}` : null,
    tenantName,
  ]
    .filter(Boolean)
    .join(" · ");

  const events: CalendarEvent[] = [
    {
      id: `maintenance-${row.id}`,
      type: "maintenance",
      date: row.reported_on,
      title: row.title,
      description: `${location} · ${row.category} · ${row.priority}`,
      status: row.status,
    },
  ];

  if (row.resolved_on) {
    events.push({
      id: `maintenance-resolved-${row.id}`,
      type: "maintenance",
      date: row.resolved_on,
      title: `${row.title} resolved`,
      description: location,
      status: row.status,
    });
  }

  return events;
}

async function getCalendarTenants() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, name, email, phone, payment_link_id, property_id, unit_id, lease_start, lease_end, rent_status, properties ( name ), units ( unit_number )"
    )
    .order("lease_end", { ascending: true });

  if (error) {
    if (isMissingTable(error, "tenants")) {
      return [];
    }

    throw error;
  }

  return (data ?? []).map((row) => toTenant(row as TenantRow));
}

async function getCalendarMaintenanceRequests() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select(
      "id, title, category, priority, status, reported_on, resolved_on, properties ( name ), units ( unit_number ), tenants ( name )"
    )
    .order("reported_on", { ascending: true });

  if (error) {
    if (isMissingTable(error, "maintenance_requests")) {
      return [];
    }

    throw error;
  }

  return (data ?? []) as MaintenanceRow[];
}

export async function getCalendarEvents(monthStart: Date) {
  const [rentRecords, tenants, maintenanceRequests] = await Promise.all([
    getRentRecords(),
    getCalendarTenants(),
    getCalendarMaintenanceRequests(),
  ]);

  const rentEvents = rentRecords
    .filter((record) => dateWithinMonth(record.dueDate, monthStart))
    .map(rentEvent);

  const leaseEvents = tenants
    .filter((tenant) => dateWithinMonth(tenant.leaseEnd, monthStart))
    .map(leaseExpiryEvent);

  const inspectionEvents = tenants
    .map(inspectionEvent)
    .filter((event) => dateWithinMonth(event.date, monthStart));

  const maintenance = maintenanceRequests
    .flatMap(maintenanceEvents)
    .filter((event) => dateWithinMonth(event.date, monthStart));

  return [...rentEvents, ...leaseEvents, ...inspectionEvents, ...maintenance].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
  );
}

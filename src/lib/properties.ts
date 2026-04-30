import type { OccupancyStatus, Property, Unit } from "@/types";
import { createClient } from "@/lib/supabase/client";

type UnitRow = {
  id: string;
  property_id: string;
  unit_number: string;
  rent: number | string;
  status: OccupancyStatus;
  tenant_name: string | null;
  due_date: string | null;
};

type PropertyRow = {
  id: string;
  name: string;
  location: string;
  units?: UnitRow[];
};

export type PropertyUnitInput = {
  id?: string;
  unitNumber: string;
  rent: number;
  status: OccupancyStatus;
  tenantName?: string | null;
  dueDate?: string | null;
};

export type PropertyWithUnits = {
  property: Property;
  units: Unit[];
};

function toUnit(row: UnitRow, propertyName: string): Unit {
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyName,
    unitNumber: row.unit_number,
    rent: Number(row.rent),
    status: row.status,
    tenantName: row.tenant_name,
    dueDate: row.due_date,
  };
}

function toPropertyWithUnits(row: PropertyRow): PropertyWithUnits {
  const units = (row.units ?? []).map((unit) => toUnit(unit, row.name));
  const occupiedCount = units.filter((unit) => unit.status === "Occupied").length;
  const monthlyIncome = units.reduce((sum, unit) => sum + unit.rent, 0);

  return {
    property: {
      id: row.id,
      name: row.name,
      location: row.location,
      unitCount: units.length,
      occupiedCount,
      monthlyIncome,
    },
    units,
  };
}

function toUnitRow(propertyId: string, unit: PropertyUnitInput) {
  const row = {
    property_id: propertyId,
    unit_number: unit.unitNumber.trim(),
    rent: unit.rent,
    status: unit.status,
    tenant_name: unit.tenantName ?? null,
    due_date: unit.dueDate ?? null,
  };

  if (unit.id && isUuid(unit.id)) {
    return { id: unit.id, ...row };
  }

  return row;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isDuplicateUnitNumberError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

function duplicateUnitNumberError() {
  return new Error("Each unit number must be unique within the property.");
}

export async function getPropertiesWithUnits() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, name, location, units ( id, property_id, unit_number, rent, status, tenant_name, due_date )"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const records = (data ?? []).map((row) => toPropertyWithUnits(row as PropertyRow));

  return {
    properties: records.map((record) => record.property),
    units: records.flatMap((record) => record.units),
  };
}

export async function getPropertyWithUnits(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, name, location, units ( id, property_id, unit_number, rent, status, tenant_name, due_date )"
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return toPropertyWithUnits(data as PropertyRow);
}

export async function createPropertyWithUnits(input: {
  name: string;
  location: string;
  units: PropertyUnitInput[];
}) {
  const supabase = createClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({ name: input.name, location: input.location })
    .select("id")
    .single();

  if (propertyError) {
    throw propertyError;
  }

  const propertyId = property.id as string;
  const { error: unitsError } = await supabase
    .from("units")
    .insert(input.units.map((unit) => toUnitRow(propertyId, unit)));

  if (unitsError) {
    await supabase.from("properties").delete().eq("id", propertyId);
    if (isDuplicateUnitNumberError(unitsError)) {
      throw duplicateUnitNumberError();
    }

    throw unitsError;
  }

  return getPropertyWithUnits(propertyId);
}

export async function updatePropertyWithUnits(
  id: string,
  input: {
    name: string;
    location: string;
    units: PropertyUnitInput[];
  }
) {
  const supabase = createClient();
  const { error: propertyError } = await supabase
    .from("properties")
    .update({ name: input.name, location: input.location })
    .eq("id", id);

  if (propertyError) {
    throw propertyError;
  }

  const { data: existingUnits, error: existingUnitsError } = await supabase
    .from("units")
    .select("id")
    .eq("property_id", id);

  if (existingUnitsError) {
    throw existingUnitsError;
  }

  const retainedIds = new Set(
    input.units
      .map((unit) => unit.id)
      .filter((unitId): unitId is string => Boolean(unitId && isUuid(unitId)))
  );
  const removedIds = (existingUnits ?? [])
    .map((unit) => unit.id as string)
    .filter((unitId) => !retainedIds.has(unitId));

  if (removedIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("units")
      .delete()
      .in("id", removedIds);

    if (deleteError) {
      throw deleteError;
    }
  }

  const existingRows = input.units
    .filter((unit) => unit.id && isUuid(unit.id))
    .map((unit) => toUnitRow(id, unit));
  const newRows = input.units
    .filter((unit) => !unit.id || !isUuid(unit.id))
    .map((unit) => toUnitRow(id, unit));

  if (existingRows.length > 0) {
    const { error: upsertError } = await supabase
      .from("units")
      .upsert(existingRows, { onConflict: "id" });

    if (upsertError) {
      if (isDuplicateUnitNumberError(upsertError)) {
        throw duplicateUnitNumberError();
      }

      throw upsertError;
    }
  }

  if (newRows.length > 0) {
    const { error: unitsError } = await supabase.from("units").insert(newRows);

    if (unitsError) {
      if (isDuplicateUnitNumberError(unitsError)) {
        throw duplicateUnitNumberError();
      }

      throw unitsError;
    }
  }

  return getPropertyWithUnits(id);
}

export async function deletePropertyRecord(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

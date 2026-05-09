"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { getPropertiesWithUnits } from "@/lib/properties";
import { createTenant, updateTenantRecord, type TenantInput } from "@/lib/tenants";
import type { Property, RentStatus, Tenant, Unit } from "@/types";

interface TenantFormProps {
  initialTenant?: Tenant | null;
}

export default function TenantForm({ initialTenant }: TenantFormProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initialTenant?.name ?? "");
  const [email, setEmail] = useState(initialTenant?.email ?? "");
  const [phone, setPhone] = useState(initialTenant?.phone ?? "");
  const [propertyId, setPropertyId] = useState(initialTenant?.propertyId ?? "");
  const [unitId, setUnitId] = useState(initialTenant?.unitId ?? "");
  const [leaseStart, setLeaseStart] = useState(initialTenant?.leaseStart ?? "");
  const [leaseEnd, setLeaseEnd] = useState(initialTenant?.leaseEnd ?? "");
  const [rentStatus, setRentStatus] = useState<RentStatus>(
    initialTenant?.rentStatus ?? "Pending"
  );

  useEffect(() => {
    let mounted = true;

    getPropertiesWithUnits()
      .then((records) => {
        if (!mounted) return;
        setProperties(records.properties);
        setUnits(records.units);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Unable to load properties and units.";
        toast.error(message);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const availableUnits = useMemo(() => {
    if (!propertyId) return [];
    return units.filter((u) => u.propertyId === propertyId && (u.status === "Vacant" || u.id === initialTenant?.unitId));
  }, [units, propertyId, initialTenant]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!initialTenant && properties.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-semibold">No Properties Found</h2>
        <p className="text-muted-foreground">You need to create a property with vacant units before adding a tenant.</p>
        <Button onClick={() => router.push("/properties/new")}>Create Property</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !propertyId || !unitId || !leaseStart || !leaseEnd) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (leaseEnd < leaseStart) {
      toast.error("Lease end date cannot be earlier than lease start date.");
      return;
    }

    const selectedProperty = properties.find((p) => p.id === propertyId);
    const selectedUnit = units.find((u) => u.id === unitId);

    if (!selectedProperty || !selectedUnit) {
      toast.error("Invalid property or unit selected.");
      return;
    }

    const tenant: TenantInput = {
      name,
      email,
      phone,
      propertyId,
      unitId,
      leaseStart,
      leaseEnd,
      rentStatus,
    };

    setSaving(true);

    try {
      if (initialTenant) {
        await updateTenantRecord(initialTenant.id, tenant);
        toast.success("Tenant updated successfully!");
      } else {
        await createTenant(tenant);
        toast.success("Tenant created successfully!");
      }

      router.push("/tenants");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save tenant.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={initialTenant ? "Edit Tenant Details" : "Add New Tenant"}
        summary="Manage tenant contact details, lease dates, and unit assignment"
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/tenants")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tenants
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email Address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Lease & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Property</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  setUnitId(""); // reset unit selection when property changes
                }}
                required
              >
                <option value="" disabled>Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                required
                disabled={!propertyId || availableUnits.length === 0}
              >
                <option value="" disabled>Select Unit</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} (RM {u.rent})
                  </option>
                ))}
              </select>
              {propertyId && availableUnits.length === 0 && (
                <p className="text-xs text-destructive">No vacant units available in this property.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Lease Start</Label>
              <Input type="date" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Lease End</Label>
              <Input type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Initial Rent Status</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={rentStatus}
                onChange={(e) => setRentStatus(e.target.value as RentStatus)}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/tenants")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : initialTenant ? "Save Changes" : "Add Tenant"}
          </Button>
        </div>
      </form>
    </div>
  );
}

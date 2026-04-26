"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Tenant, RentStatus } from "@/types";

interface TenantFormProps {
  initialTenant?: Tenant | null;
}

export default function TenantForm({ initialTenant }: TenantFormProps) {
  const router = useRouter();
  const { properties, units, addTenant, updateTenant } = useStore();
  const [hydrated, setHydrated] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [rentStatus, setRentStatus] = useState<RentStatus>("Paid");

  useEffect(() => {
    setHydrated(true);
    if (initialTenant) {
      setName(initialTenant.name);
      setEmail(initialTenant.email);
      setPhone(initialTenant.phone);
      setPropertyId(initialTenant.propertyId);
      setUnitId(initialTenant.unitId);
      setLeaseStart(initialTenant.leaseStart);
      setLeaseEnd(initialTenant.leaseEnd);
      setRentStatus(initialTenant.rentStatus);
    }
  }, [initialTenant]);

  const availableUnits = useMemo(() => {
    if (!propertyId) return [];
    return units.filter((u) => u.propertyId === propertyId && (u.status === "Vacant" || u.id === initialTenant?.unitId));
  }, [units, propertyId, initialTenant]);

  if (!hydrated) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !propertyId || !unitId || !leaseStart || !leaseEnd) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const selectedProperty = properties.find((p) => p.id === propertyId);
    const selectedUnit = units.find((u) => u.id === unitId);

    if (!selectedProperty || !selectedUnit) {
      toast.error("Invalid property or unit selected.");
      return;
    }

    const tId = initialTenant?.id || `t-${Date.now()}`;
    const newTenant: Tenant = {
      id: tId,
      name,
      email,
      phone,
      propertyId,
      propertyName: selectedProperty.name,
      unitId,
      unitNumber: selectedUnit.unitNumber,
      leaseStart,
      leaseEnd,
      rentStatus,
    };

    if (initialTenant) {
      updateTenant(newTenant);
      toast.success("Tenant updated successfully!");
    } else {
      addTenant(newTenant);
      toast.success("Tenant created successfully!");
    }

    router.push("/tenants");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/tenants")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {initialTenant ? "Edit Tenant Details" : "Add New Tenant"}
        </h1>
      </div>

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
          <Button type="submit">{initialTenant ? "Save Changes" : "Add Tenant"}</Button>
        </div>
      </form>
    </div>
  );
}

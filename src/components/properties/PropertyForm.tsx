"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createPropertyWithUnits,
  updatePropertyWithUnits,
  type PropertyUnitInput,
} from "@/lib/properties";
import type { Property, Unit, OccupancyStatus } from "@/types";

interface PropertyFormProps {
  initialProperty?: Property | null;
  initialUnits?: Unit[];
}

export default function PropertyForm({ initialProperty, initialUnits }: PropertyFormProps) {
  const router = useRouter();
  
  const [name, setName] = useState(initialProperty?.name ?? "");
  const [location, setLocation] = useState(initialProperty?.location ?? "");
  const [units, setUnits] = useState<Partial<Unit>[]>(() => initialUnits ?? []);
  const [saving, setSaving] = useState(false);

  const handleAddUnit = () => {
    setUnits([
      ...units,
      {
        id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        unitNumber: "",
        rent: 0,
        status: "Vacant",
        tenantName: null,
        dueDate: null,
      },
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    const unitToRemove = units[index];
    if (unitToRemove.status === "Occupied") {
      toast.error("Cannot remove an occupied unit.");
      return;
    }
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleUnitChange = (index: number, field: keyof Unit, value: Unit[keyof Unit]) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !location) {
      toast.error("Please fill in property details.");
      return;
    }

    if (units.length === 0) {
      toast.error("Please add at least one unit.");
      return;
    }

    for (const u of units) {
      if (!u.unitNumber || (u.rent ?? 0) <= 0) {
        toast.error("Please fill in all unit details correctly.");
        return;
      }
    }

    const propertyUnits: PropertyUnitInput[] = units.map((u) => {
      const unit: PropertyUnitInput = {
        unitNumber: u.unitNumber!,
        rent: u.rent!,
        status: (u.status ?? "Vacant") as OccupancyStatus,
        tenantName: u.tenantName || null,
        dueDate: u.dueDate || null,
      };

      if (u.id) {
        unit.id = u.id;
      }

      return unit;
    });

    setSaving(true);

    try {
      if (initialProperty) {
        await updatePropertyWithUnits(initialProperty.id, {
          name,
          location,
          units: propertyUnits,
        });
        toast.success("Property updated successfully!");
      } else {
        await createPropertyWithUnits({
          name,
          location,
          units: propertyUnits,
        });
        toast.success("Property created successfully!");
      }

      router.push("/properties");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save property.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={initialProperty ? "Edit Property" : "Add New Property"}
        summary="Set property details, unit rent, status, and due dates"
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/properties")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Property Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Property Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Greenview Apartments"
              />
            </div>
            <div className="space-y-2">
              <Label>Location / Address</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kuala Lumpur, WP"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Units</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddUnit}>
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
          </CardHeader>
          <CardContent>
            {units.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border text-sm text-muted-foreground mt-4">
                No units added yet. Add at least one unit to create this property.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {units.map((unit, index) => (
                  <div key={unit.id} className="flex items-end gap-3 bg-muted/20 p-4 rounded-lg border border-border">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs">Unit Number</Label>
                      <Input
                        value={unit.unitNumber}
                        onChange={(e) => handleUnitChange(index, "unitNumber", e.target.value)}
                        placeholder="e.g. 101"
                        className="h-9"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs">Rent (RM)</Label>
                      <Input
                        type="number"
                        value={unit.rent || ""}
                        onChange={(e) => handleUnitChange(index, "rent", Number(e.target.value))}
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <select
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={unit.status}
                        onChange={(e) => handleUnitChange(index, "status", e.target.value)}
                        disabled={unit.status === "Occupied"}
                      >
                        <option value="Vacant">Vacant</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleRemoveUnit(index)}
                      disabled={unit.status === "Occupied"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/properties")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : initialProperty ? "Save Changes" : "Create Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}

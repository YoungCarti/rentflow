"use client";

import { useStore } from "@/lib/store";
import PropertyForm from "@/components/properties/PropertyForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  const { properties, units } = useStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const property = properties.find((p) => p.id === propertyId);
  const propertyUnits = units.filter((u) => u.propertyId === propertyId);

  if (!property) {
    return <div className="p-8 text-center text-muted-foreground">Property not found.</div>;
  }

  return (
    <div className="py-6">
      <PropertyForm initialProperty={property} initialUnits={propertyUnits} />
    </div>
  );
}

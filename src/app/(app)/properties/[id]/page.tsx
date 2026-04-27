"use client";

import { useEffect, useState } from "react";
import PropertyForm from "@/components/properties/PropertyForm";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getPropertyWithUnits } from "@/lib/properties";
import type { Property, Unit } from "@/types";

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [propertyUnits, setPropertyUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPropertyWithUnits(propertyId)
      .then((record) => {
        if (!mounted) return;
        setProperty(record.property);
        setPropertyUnits(record.units);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to load property.";
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
  }, [propertyId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  if (!property) {
    return <div className="p-8 text-center text-muted-foreground">Property not found.</div>;
  }

  return (
    <div className="py-6">
      <PropertyForm initialProperty={property} initialUnits={propertyUnits} />
    </div>
  );
}

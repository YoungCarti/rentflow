"use client";

import { useStore } from "@/lib/store";
import TenantForm from "@/components/tenants/TenantForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditTenantPage() {
  const params = useParams();
  const tenantId = params.id as string;
  
  const { tenants } = useStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const tenant = tenants.find((t) => t.id === tenantId);

  if (!tenant) {
    return <div className="p-8 text-center text-muted-foreground">Tenant not found.</div>;
  }

  return (
    <div className="py-6">
      <TenantForm initialTenant={tenant} />
    </div>
  );
}

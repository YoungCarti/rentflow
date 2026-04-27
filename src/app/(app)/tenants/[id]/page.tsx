"use client";

import { useEffect, useState } from "react";
import TenantForm from "@/components/tenants/TenantForm";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getTenant } from "@/lib/tenants";
import type { Tenant } from "@/types";

export default function EditTenantPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getTenant(tenantId)
      .then((record) => {
        if (mounted) {
          setTenant(record);
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to load tenant.";
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
  }, [tenantId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  if (!tenant) {
    return <div className="p-8 text-center text-muted-foreground">Tenant not found.</div>;
  }

  return (
    <div className="py-6">
      <TenantForm initialTenant={tenant} />
    </div>
  );
}

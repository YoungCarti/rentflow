"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import TenantTable from "@/components/tenants/TenantTable";
import { toast } from "sonner";
import type { Tenant } from "@/types";
import { deleteTenantRecord, getTenants } from "@/lib/tenants";
import { semanticTone } from "@/lib/color-system";

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getTenants()
      .then((records) => {
        if (mounted) {
          setTenants(records);
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to load tenants.";
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

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading tenants...</div>;
  }

  const paid    = tenants.filter((t) => t.rentStatus === "Paid").length;
  const pending = tenants.filter((t) => t.rentStatus === "Pending").length;
  const overdue = tenants.filter((t) => t.rentStatus === "Overdue").length;

  const handleDelete = async (tenant: Tenant) => {
    if (!confirm(`Are you sure you want to remove ${tenant.name}? Their unit will become vacant.`)) {
      return;
    }

    try {
      await deleteTenantRecord(tenant.id);
      setTenants((current) => current.filter((record) => record.id !== tenant.id));
      toast.success("Tenant removed successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove tenant.";
      toast.error(message);
    }
  };

  const handlePaymentLinkRegenerated = (tenantId: string, paymentLinkId: string) => {
    setTenants((current) =>
      current.map((tenant) =>
        tenant.id === tenantId ? { ...tenant, paymentLinkId } : tenant
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        summary={`${tenants.length} active tenants · click any row to view details`}
        action={
          <Button onClick={() => router.push("/tenants/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        }
      />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border shadow-sm text-sm">
          <span className="font-bold text-foreground">{tenants.length}</span>
          <span className="text-muted-foreground">Total</span>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${semanticTone.success.surface}`}>
          <span className={`font-bold ${semanticTone.success.text}`}>{paid}</span>
          <span className={semanticTone.success.textSoft}>Paid</span>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${semanticTone.pending.surface}`}>
          <span className={`font-bold ${semanticTone.pending.text}`}>{pending}</span>
          <span className={semanticTone.pending.textSoft}>Pending</span>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${semanticTone.danger.surface}`}>
          <span className={`font-bold ${semanticTone.danger.text}`}>{overdue}</span>
          <span className={semanticTone.danger.textSoft}>Overdue</span>
        </div>
      </div>

      {/* Table card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Tenants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <TenantTable 
            tenants={tenants} 
            onEdit={(t) => router.push(`/tenants/${t.id}`)} 
            onDelete={handleDelete} 
            onPaymentLinkRegenerated={handlePaymentLinkRegenerated}
          />
        </CardContent>
      </Card>
    </div>
  );
}

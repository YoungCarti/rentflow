"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TenantTable from "@/components/tenants/TenantTable";
import { toast } from "sonner";
import type { Tenant } from "@/types";
import { deleteTenantRecord, getTenants } from "@/lib/tenants";

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tenants.length} active tenants · click any row to view details
          </p>
        </div>
        <Button onClick={() => router.push("/tenants/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border shadow-sm text-sm">
          <span className="font-bold text-foreground">{tenants.length}</span>
          <span className="text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-sm">
          <span className="font-bold text-green-700 dark:text-green-500">{paid}</span>
          <span className="text-green-600 dark:text-green-400">Paid</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 text-sm">
          <span className="font-bold text-yellow-700 dark:text-yellow-500">{pending}</span>
          <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-sm">
          <span className="font-bold text-red-700 dark:text-red-500">{overdue}</span>
          <span className="text-red-600 dark:text-red-400">Overdue</span>
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

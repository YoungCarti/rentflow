"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TenantTable from "@/components/tenants/TenantTable";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Tenant } from "@/types";

export default function TenantsPage() {
  const router = useRouter();
  const { tenants, deleteTenant } = useStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className="p-8 text-center text-muted-foreground">Loading tenants...</div>;
  }

  const paid    = tenants.filter((t) => t.rentStatus === "Paid").length;
  const pending = tenants.filter((t) => t.rentStatus === "Pending").length;
  const overdue = tenants.filter((t) => t.rentStatus === "Overdue").length;

  const handleDelete = (tenant: Tenant) => {
    if (confirm(`Are you sure you want to remove ${tenant.name}? Their unit will become vacant.`)) {
      deleteTenant(tenant.id);
      toast.success("Tenant removed successfully.");
    }
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
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border shadow-sm text-sm">
          <span className="font-bold text-foreground">{tenants.length}</span>
          <span className="text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-100 text-sm">
          <span className="font-bold text-green-700">{paid}</span>
          <span className="text-green-600">Paid</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 border border-yellow-100 text-sm">
          <span className="font-bold text-yellow-700">{pending}</span>
          <span className="text-yellow-600">Pending</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-100 text-sm">
          <span className="font-bold text-red-700">{overdue}</span>
          <span className="text-red-600">Overdue</span>
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
          />
        </CardContent>
      </Card>
    </div>
  );
}

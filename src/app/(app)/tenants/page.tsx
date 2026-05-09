"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import TenantTable from "@/components/tenants/TenantTable";
import { toast } from "sonner";
import type { RentStatus, Tenant } from "@/types";
import { deleteTenantRecord, getTenants } from "@/lib/tenants";
import { semanticTone } from "@/lib/color-system";
import { cn } from "@/lib/utils";

type TenantStatusFilter = RentStatus | "";

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TenantStatusFilter>("");

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
  const activeSummaryLabel = statusFilter ? `${statusFilter} tenants` : "All tenants";
  const summaryCardBase =
    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const activeSummaryCard = "border-foreground bg-foreground text-background shadow-md";

  const handleDelete = async () => {
    if (!tenantToDelete) {
      return;
    }

    try {
      setDeletingId(tenantToDelete.id);
      await deleteTenantRecord(tenantToDelete.id);
      setTenants((current) => current.filter((record) => record.id !== tenantToDelete.id));
      setTenantToDelete(null);
      toast.success("Tenant removed successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove tenant.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
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
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            aria-pressed={!statusFilter}
            onClick={() => setStatusFilter("")}
            className={cn(
              summaryCardBase,
              !statusFilter ? activeSummaryCard : "border-border bg-card text-foreground"
            )}
          >
            <span className="font-bold">{tenants.length}</span>
            <span className={cn(!statusFilter ? "text-background" : "text-muted-foreground")}>
              Total
            </span>
          </button>
          <button
            type="button"
            aria-pressed={statusFilter === "Paid"}
            onClick={() => setStatusFilter("Paid")}
            className={cn(
              summaryCardBase,
              statusFilter === "Paid" ? activeSummaryCard : semanticTone.success.surface
            )}
          >
            <span
              className={cn(
                "font-bold",
                statusFilter === "Paid" ? "text-background" : semanticTone.success.text
              )}
            >
              {paid}
            </span>
            <span
              className={cn(
                statusFilter === "Paid" ? "text-background" : semanticTone.success.textSoft
              )}
            >
              Paid
            </span>
          </button>
          <button
            type="button"
            aria-pressed={statusFilter === "Pending"}
            onClick={() => setStatusFilter("Pending")}
            className={cn(
              summaryCardBase,
              statusFilter === "Pending" ? activeSummaryCard : semanticTone.pending.surface
            )}
          >
            <span
              className={cn(
                "font-bold",
                statusFilter === "Pending" ? "text-background" : semanticTone.pending.text
              )}
            >
              {pending}
            </span>
            <span
              className={cn(
                statusFilter === "Pending" ? "text-background" : semanticTone.pending.textSoft
              )}
            >
              Pending
            </span>
          </button>
          <button
            type="button"
            aria-pressed={statusFilter === "Overdue"}
            onClick={() => setStatusFilter("Overdue")}
            className={cn(
              summaryCardBase,
              statusFilter === "Overdue" ? activeSummaryCard : semanticTone.danger.surface
            )}
          >
            <span
              className={cn(
                "font-bold",
                statusFilter === "Overdue" ? "text-background" : semanticTone.danger.text
              )}
            >
              {overdue}
            </span>
            <span
              className={cn(
                statusFilter === "Overdue" ? "text-background" : semanticTone.danger.textSoft
              )}
            >
              Overdue
            </span>
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing: <span className="font-medium text-foreground">{activeSummaryLabel}</span>
        </p>
      </div>

      {/* Table card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Tenants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <TenantTable 
            tenants={tenants} 
            statusFilter={statusFilter}
            onEdit={(t) => router.push(`/tenants/${t.id}`)} 
            onDelete={setTenantToDelete}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={Boolean(tenantToDelete)}
        title="Remove tenant?"
        description={
          tenantToDelete
            ? `This will remove ${tenantToDelete.name} and mark Unit ${tenantToDelete.unitNumber} as vacant. This cannot be undone.`
            : ""
        }
        confirmLabel="Remove tenant"
        loading={deletingId === tenantToDelete?.id}
        onOpenChange={(open) => !open && setTenantToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

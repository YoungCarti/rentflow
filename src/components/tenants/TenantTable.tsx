"use client";

import { useState } from "react";
import { Search, Phone, Mail, CalendarDays, Home, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/ui/StatusBadge";
import CopyPaymentLinkButton from "@/components/payments/CopyPaymentLinkButton";
import { regenerateTenantPaymentLink } from "@/lib/tenants";
import { toast } from "sonner";
import type { Tenant } from "@/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const today = new Date();
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function LeaseDaysLabel({ leaseEnd }: { leaseEnd: string }) {
  const days = daysUntil(leaseEnd);
  if (days < 0)
    return <span className="text-xs text-red-600 font-medium">Expired {Math.abs(days)}d ago</span>;
  if (days <= 30)
    return <span className="text-xs text-amber-600 font-medium">{days}d remaining</span>;
  if (days <= 90)
    return <span className="text-xs text-yellow-600 font-medium">{days}d remaining</span>;
  return <span className="text-xs text-muted-foreground">{days}d remaining</span>;
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function TenantModal({
  tenant,
  open,
  onClose,
  onRegeneratePaymentLink,
  regenerating,
}: {
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
  onRegeneratePaymentLink: (tenant: Tenant) => void;
  regenerating: boolean;
}) {
  if (!tenant) return null;
  const leaseDays = daysUntil(tenant.leaseEnd);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{tenant.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusBadge status={tenant.rentStatus} />
            <span className="text-sm text-muted-foreground">Current rent status</span>
          </div>

          <Separator />

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact
            </p>
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{tenant.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{tenant.phone}</span>
            </div>
          </div>

          <Separator />

          {/* Property */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Property
            </p>
            <div className="flex items-center gap-2.5 text-sm">
              <Home className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                {tenant.propertyName} · Unit {tenant.unitNumber}
              </span>
            </div>
          </div>

          <Separator />

          {/* Payment link */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Payment Link
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyPaymentLinkButton paymentLinkId={tenant.paymentLinkId} showOpen />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={regenerating}
                onClick={() => onRegeneratePaymentLink(tenant)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {regenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Lease */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lease Period
            </p>
            <div className="flex items-center gap-2.5 text-sm">
              <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                {formatDate(tenant.leaseStart)} → {formatDate(tenant.leaseEnd)}
              </span>
            </div>
            <div className="ml-6">
              <LeaseDaysLabel leaseEnd={tenant.leaseEnd} />
            </div>
          </div>

          {/* Progress bar for lease */}
          {(() => {
            const start = new Date(tenant.leaseStart).getTime();
            const end   = new Date(tenant.leaseEnd).getTime();
            const today = new Date().getTime();
            const pct   = Math.min(100, Math.max(0, Math.round(((today - start) / (end - start)) * 100)));
            return (
              <div className="space-y-1 ml-6">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lease progress</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      leaseDays < 0 ? "bg-red-500" : leaseDays <= 30 ? "bg-amber-400" : "bg-blue-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export default function TenantTable({ 
  tenants, 
  onEdit, 
  onDelete,
  onPaymentLinkRegenerated,
}: { 
  tenants: Tenant[],
  onEdit: (t: Tenant) => void,
  onDelete: (t: Tenant) => void,
  onPaymentLinkRegenerated: (tenantId: string, paymentLinkId: string) => void,
}) {
  const [query, setQuery]             = useState("");
  const [selected, setSelected]       = useState<Tenant | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [tenantToRegenerate, setTenantToRegenerate] = useState<Tenant | null>(null);

  const filtered = tenants.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.propertyName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.unitNumber.includes(q)
    );
  });

  function openModal(tenant: Tenant) {
    setSelected(tenant);
    setModalOpen(true);
  }

  async function handleRegeneratePaymentLink() {
    if (!tenantToRegenerate) {
      return;
    }

    setRegeneratingId(tenantToRegenerate.id);

    try {
      const paymentLinkId = await regenerateTenantPaymentLink(tenantToRegenerate.id);
      onPaymentLinkRegenerated(tenantToRegenerate.id, paymentLinkId);
      setSelected((current) =>
        current?.id === tenantToRegenerate.id ? { ...current, paymentLinkId } : current
      );
      setTenantToRegenerate(null);
      toast.success("Payment link regenerated.");
    } catch (error) {
      const supabaseError = error as { message?: string };
      const message =
        error instanceof Error
          ? error.message
          : supabaseError.message ?? "Unable to regenerate payment link.";
      toast.error(message);
    } finally {
      setRegeneratingId(null);
    }
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name, property, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Property · Unit</TableHead>
            <TableHead>Lease Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Link</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                No tenants match your search.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((t) => (
              <TableRow
                key={t.id}
                className="cursor-pointer group relative"
                onClick={() => openModal(t)}
              >
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm">{t.email}</p>
                    <p className="text-xs text-muted-foreground">{t.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.propertyName}
                  <span className="text-foreground font-medium"> · {t.unitNumber}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm">
                      {formatDate(t.leaseStart)} → {formatDate(t.leaseEnd)}
                    </p>
                    <LeaseDaysLabel leaseEnd={t.leaseEnd} />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.rentStatus} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <CopyPaymentLinkButton paymentLinkId={t.paymentLinkId} />
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(t)}
                    >
                      Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(t)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTenantToRegenerate(t)}>
                          <RefreshCw className="w-4 h-4 mr-2" /> Regenerate link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(t)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TenantModal
        tenant={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegeneratePaymentLink={setTenantToRegenerate}
        regenerating={selected ? regeneratingId === selected.id : false}
      />
      <ConfirmationDialog
        open={Boolean(tenantToRegenerate)}
        title="Regenerate payment link?"
        description={
          tenantToRegenerate
            ? `This will replace ${tenantToRegenerate.name}'s payment link. The old link will stop working immediately.`
            : ""
        }
        confirmLabel="Regenerate link"
        variant="default"
        loading={regeneratingId === tenantToRegenerate?.id}
        onOpenChange={(open) => !open && setTenantToRegenerate(null)}
        onConfirm={handleRegeneratePaymentLink}
      />
    </>
  );
}

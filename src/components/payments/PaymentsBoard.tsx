"use client";

import { useState } from "react";
import { ImageIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { Payment, PaymentApprovalStatus } from "@/types";

type FilterTab = "All" | PaymentApprovalStatus;
const TABS: FilterTab[] = ["All", "Pending", "Approved", "Rejected"];

function formatRM(n: number) {
  return `RM ${n.toLocaleString()}`;
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Proof placeholder ────────────────────────────────────────────────────────

function ProofPlaceholder({ resolved }: { resolved: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 h-36 rounded-lg border-2 border-dashed transition-colors",
        resolved
          ? "border-muted bg-muted/20"
          : "border-blue-200 bg-blue-50/50"
      )}
    >
      <ImageIcon className={cn("w-8 h-8", resolved ? "text-muted-foreground/40" : "text-blue-300")} />
      <p className={cn("text-xs font-medium", resolved ? "text-muted-foreground/50" : "text-blue-400")}>
        Payment Proof
      </p>
      <p className={cn("text-xs", resolved ? "text-muted-foreground/40" : "text-blue-300")}>
        Screenshot / Receipt
      </p>
    </div>
  );
}

// ─── Pending card ─────────────────────────────────────────────────────────────

function PendingCard({
  payment,
  onApprove,
  onReject,
  resolvedStatus,
}: {
  payment: Payment;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  resolvedStatus: PaymentApprovalStatus | null;
}) {
  const resolved = resolvedStatus !== null;
  const approved = resolvedStatus === "Approved";

  return (
    <Card
      className={cn(
        "shadow-sm transition-all",
        resolved && "opacity-60"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Tenant + amount */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-foreground">{payment.tenantName}</p>
            <p className="text-xs text-muted-foreground">
              {payment.propertyName} · Unit {payment.unitNumber}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-base text-foreground">{formatRM(payment.amount)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(payment.date)}</p>
          </div>
        </div>

        {/* Proof placeholder */}
        <ProofPlaceholder resolved={resolved} />

        {/* Action area */}
        {!resolved ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onReject(payment.id)}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onApprove(payment.id)}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            {approved ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Approved
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <XCircle className="w-4 h-4" /> Rejected
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main board ───────────────────────────────────────────────────────────────

export default function PaymentsBoard({ payments }: { payments: Payment[] }) {
  // Track in-session status overrides (Approve / Reject actions)
  const [overrides, setOverrides] = useState<Record<string, PaymentApprovalStatus>>({});
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  function effectiveStatus(p: Payment): PaymentApprovalStatus {
    return overrides[p.id] ?? p.status;
  }

  function approve(id: string) {
    setOverrides((prev) => ({ ...prev, [id]: "Approved" }));
  }
  function reject(id: string) {
    setOverrides((prev) => ({ ...prev, [id]: "Rejected" }));
  }

  const pendingPayments = payments.filter((p) => effectiveStatus(p) === "Pending");

  // Tab counts (reflect live overrides)
  const counts = TABS.reduce<Record<FilterTab, number>>((acc, tab) => {
    acc[tab] =
      tab === "All"
        ? payments.length
        : payments.filter((p) => effectiveStatus(p) === tab).length;
    return acc;
  }, {} as Record<FilterTab, number>);

  const filteredHistory =
    activeTab === "All"
      ? payments
      : payments.filter((p) => effectiveStatus(p) === activeTab);

  return (
    <div className="space-y-8">
      {/* ── Pending approvals ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-foreground">
            Pending Approvals
          </h2>
          {pendingPayments.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              {pendingPayments.length}
            </span>
          )}
        </div>

        {pendingPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center border border-dashed border-border rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground">No pending payments to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPayments.map((p) => (
              <PendingCard
                key={p.id}
                payment={p}
                onApprove={approve}
                onReject={reject}
                resolvedStatus={overrides[p.id] ?? null}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Payment history ───────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Payment History</h2>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  activeTab === tab
                    ? "bg-slate-100 text-slate-600"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Tenant</TableHead>
              <TableHead>Property · Unit</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.tenantName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.propertyName}
                  <span className="text-foreground font-medium"> · {p.unitNumber}</span>
                </TableCell>
                <TableCell className="font-semibold">{formatRM(p.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(p.date)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={effectiveStatus(p)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, Download, ExternalLink, FileText, ImageIcon, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import {
  createPaymentProofSignedUrl,
  updatePaymentStatus,
} from "@/lib/rent-payments-client";
import { toast } from "sonner";
import type { Payment, PaymentApprovalStatus } from "@/types";

type FilterTab =
  | "All"
  | "Online"
  | "Manual Proofs"
  | "Pending Review"
  | PaymentApprovalStatus;
const TABS: FilterTab[] = [
  "All",
  "Online",
  "Manual Proofs",
  "Pending Review",
  "Approved",
  "Rejected",
];

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

function isOnlinePayment(payment: Payment) {
  return payment.method === "Online";
}

function isManualProofPayment(payment: Payment) {
  return !isOnlinePayment(payment) && Boolean(payment.proofUrl);
}

function effectivePaymentStatus(
  payment: Payment,
  overrides: Record<string, PaymentApprovalStatus>
) {
  const status = overrides[payment.id] ?? payment.status;

  if (isOnlinePayment(payment) && status === "Pending") {
    return "Approved";
  }

  return status;
}

function paymentMethodLabel(payment: Payment) {
  if (isOnlinePayment(payment)) {
    return {
      label: "Online",
      detail: "Payment link",
    };
  }

  if (payment.proofUrl) {
    return {
      label: "Proof Upload",
      detail: payment.method === "Cash" ? "Cash" : "Manual transfer",
    };
  }

  if (payment.method === "Cash") {
    return {
      label: "Cash",
      detail: "Manual payment",
    };
  }

  if (payment.method === "Bank Transfer") {
    return {
      label: "Manual Transfer",
      detail: "Bank transfer",
    };
  }

  return {
    label: "Manual Transfer",
    detail: "Method not recorded",
  };
}

function ProofPreview({
  proofPath,
  resolved,
}: {
  proofPath?: string;
  resolved: boolean;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const isPdf = proofPath?.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    let mounted = true;

    if (!proofPath) {
      return;
    }

    createPaymentProofSignedUrl(proofPath)
      .then((url) => {
        if (mounted) {
          setSignedUrl(url);
        }
      })
      .catch(() => {
        if (mounted) {
          setSignedUrl(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [proofPath]);

  if (signedUrl) {
    return (
      <a
        href={signedUrl}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "group flex h-36 overflow-hidden rounded-lg border transition-colors",
          resolved ? "border-muted bg-muted/20" : "border-blue-200 bg-blue-50/40"
        )}
      >
        {isPdf ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-blue-500" />
            <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
              View PDF proof
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        ) : (
          <div className="relative flex-1">
            <Image
              src={signedUrl}
              alt="Payment proof"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              unoptimized
              className="object-cover transition-transform group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
              View
            </span>
          </div>
        )}
      </a>
    );
  }

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
        {proofPath ? "Loading proof" : "Payment Proof"}
      </p>
      <p className={cn("text-xs", resolved ? "text-muted-foreground/40" : "text-blue-300")}>
        {proofPath ? "Unable to preview" : "No proof uploaded"}
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
  saving,
}: {
  payment: Payment;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  resolvedStatus: PaymentApprovalStatus | null;
  saving: boolean;
}) {
  const resolved = resolvedStatus !== null;
  const approved = resolvedStatus === "Approved";

  return (
    <article
      className={cn(
        "border-b border-border py-4 transition-opacity",
        resolved && "opacity-60"
      )}
    >
      <div className="space-y-3">
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

        <ProofPreview proofPath={payment.proofUrl} resolved={resolved} />

        {/* Action area */}
        {!resolved ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={saving}
              onClick={() => onReject(payment.id)}
            >
              <XCircle className="w-4 h-4" />
              {saving ? "Saving..." : "Reject"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              disabled={saving}
              onClick={() => onApprove(payment.id)}
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? "Saving..." : "Approve"}
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
      </div>
    </article>
  );
}

// ─── Main board ───────────────────────────────────────────────────────────────

export default function PaymentsBoard({ payments }: { payments: Payment[] }) {
  // Track in-session status overrides (Approve / Reject actions)
  const [overrides, setOverrides] = useState<Record<string, PaymentApprovalStatus>>({});
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [savingId, setSavingId] = useState<string | null>(null);

  function effectiveStatus(p: Payment): PaymentApprovalStatus {
    return effectivePaymentStatus(p, overrides);
  }

  async function resolvePayment(id: string, status: PaymentApprovalStatus) {
    setSavingId(id);

    try {
      const payment = await updatePaymentStatus(id, status);
      setOverrides((prev) => ({ ...prev, [id]: payment.status }));
      toast.success(`Payment ${payment.status.toLowerCase()}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update payment.";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  function approve(id: string) {
    void resolvePayment(id, "Approved");
  }
  function reject(id: string) {
    void resolvePayment(id, "Rejected");
  }

  const pendingPayments = payments.filter(
    (p) => isManualProofPayment(p) && effectiveStatus(p) === "Pending"
  );

  // Tab counts (reflect live overrides)
  const counts = TABS.reduce<Record<FilterTab, number>>((acc, tab) => {
    acc[tab] =
      tab === "All"
        ? payments.length
        : tab === "Online"
        ? payments.filter(isOnlinePayment).length
        : tab === "Manual Proofs"
        ? payments.filter(isManualProofPayment).length
        : tab === "Pending Review"
        ? pendingPayments.length
        : payments.filter((p) => effectiveStatus(p) === tab).length;
    return acc;
  }, {} as Record<FilterTab, number>);

  const filteredHistory = payments.filter((payment) => {
    if (activeTab === "All") return true;
    if (activeTab === "Online") return isOnlinePayment(payment);
    if (activeTab === "Manual Proofs") return isManualProofPayment(payment);
    if (activeTab === "Pending Review") {
      return (
        isManualProofPayment(payment) && effectiveStatus(payment) === "Pending"
      );
    }

    return effectiveStatus(payment) === activeTab;
  });

  return (
    <div className="space-y-8">
      {/* ── Manual proof review ───────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-foreground">
            Manual Proof Reviews
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
            <p className="text-xs text-muted-foreground">No manual payment proofs need review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {pendingPayments.map((p) => (
              <PendingCard
                key={p.id}
                payment={p}
                onApprove={approve}
                onReject={reject}
                resolvedStatus={overrides[p.id] ?? null}
                saving={savingId === p.id}
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
                  ? "bg-card text-foreground shadow-sm"
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

        <div className="overflow-x-auto border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Tenant</TableHead>
                <TableHead>Property · Unit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
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
                    {(() => {
                      const method = paymentMethodLabel(p);

                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {method.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {method.detail}
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {p.proofUrl ? (
                      <ProofLink proofPath={p.proofUrl} />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={effectiveStatus(p)} />
                  </TableCell>
                  <TableCell>
                    {effectiveStatus(p) === "Approved" ? (
                      <Button asChild variant="ghost" size="sm" className="gap-1.5">
                        <Link href={`/receipts/${p.id}`}>
                          <Download className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ProofLink({ proofPath }: { proofPath: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    createPaymentProofSignedUrl(proofPath)
      .then((url) => {
        if (mounted) {
          setSignedUrl(url);
        }
      })
      .catch(() => {
        if (mounted) {
          setSignedUrl(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [proofPath]);

  if (!signedUrl) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
    >
      View proof
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

"use client";

import { useState } from "react";
import { Banknote, CreditCard, Globe, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/ui/StatusBadge";
import CopyPaymentLinkButton from "@/components/payments/CopyPaymentLinkButton";
import CopyReminderMessageButton from "@/components/payments/CopyReminderMessageButton";
import { cn } from "@/lib/utils";
import { submitPayment } from "@/lib/rent-payments-client";
import {
  getActiveRentRecords,
  getHistoricalRentRecords,
  isSupersededByLaterPaidRecord,
} from "@/lib/rent-reminders";
import { semanticTone } from "@/lib/color-system";
import { toast } from "sonner";
import type { PaymentMethod, RentRecord, RentStatus } from "@/types";

type FilterTab = "All" | RentStatus | "History";

const TABS: FilterTab[] = ["All", "Paid", "Pending", "Overdue", "History"];

const methodIcon: Record<string, React.ReactNode> = {
  "Bank Transfer": <CreditCard className="w-3.5 h-3.5" />,
  "Cash":          <Banknote   className="w-3.5 h-3.5" />,
  "Online":        <Globe      className="w-3.5 h-3.5" />,
};

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusHint(record: RentRecord, historical: boolean) {
  if (historical) {
    return "Older record";
  }

  if (record.status === "Paid") {
    return "Settled";
  }

  if (record.status === "Pending" && record.paymentMethod) {
    return "Under review";
  }

  if (record.status === "Overdue") {
    return "Needs follow-up";
  }

  return "Awaiting payment";
}

export default function RentTable({ records }: { records: RentRecord[] }) {
  const [rentRecords, setRentRecords] = useState(records);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const activeRecords = getActiveRentRecords(rentRecords);
  const historyRecords = getHistoricalRentRecords(rentRecords);

  const counts = TABS.reduce<Record<FilterTab, number>>((acc, tab) => {
    if (tab === "All") {
      acc[tab] = rentRecords.length;
    } else if (tab === "History") {
      acc[tab] = historyRecords.length;
    } else {
      acc[tab] = activeRecords.filter((r) => r.status === tab).length;
    }

    return acc;
  }, {} as Record<FilterTab, number>);

  const filtered = (() => {
    if (activeTab === "All") {
      return rentRecords;
    }

    if (activeTab === "History") {
      return historyRecords;
    }

    return activeRecords.filter((r) => r.status === activeTab);
  })();

  // Totals for the active view
  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);

  async function handleSubmitPayment(
    record: RentRecord,
    proofFile: File,
    method: PaymentMethod = "Bank Transfer"
  ) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    if (!allowedTypes.includes(proofFile.type)) {
      toast.error("Upload a JPG, PNG, WebP, or PDF proof.");
      return;
    }

    if (proofFile.size > 5 * 1024 * 1024) {
      toast.error("Payment proof must be 5MB or smaller.");
      return;
    }

    setSubmittingId(record.id);

    try {
      await submitPayment({
        rentRecordId: record.id,
        tenantId: record.tenantId,
        amount: record.amount,
        date: new Date().toISOString().slice(0, 10),
        method,
        proofFile,
      });
      setRentRecords((current) =>
        current.map((item) =>
          item.id === record.id ? { ...item, status: "Pending", paymentMethod: method } : item
        )
      );
      toast.success("Payment submitted for review.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit payment.";
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-4">
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
                  ? tab === "Overdue"
                    ? semanticTone.danger.badge
                    : tab === "Pending"
                    ? semanticTone.pending.badge
                    : tab === "Paid"
                    ? semanticTone.success.badge
                    : tab === "History"
                    ? semanticTone.neutral.badge
                    : semanticTone.neutral.badge
                  : "bg-muted text-muted-foreground"
              )}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-total bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted/40 border border-border text-sm">
        <span className="text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          {activeTab !== "All" && ` · ${activeTab}`}
        </span>
        <span className="font-bold text-foreground">{formatRM(totalAmount)}</span>
      </div>

      {/* Table */}
      <div className="max-h-[640px] overflow-auto rounded-lg border border-border">
      <Table className="min-w-[1180px]">
        <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[15%]">Tenant</TableHead>
            <TableHead>Property · Unit</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                No rent records found for this view.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((r) => {
              const historical = isSupersededByLaterPaidRecord(r, rentRecords);

              return (
              <TableRow
                key={r.id}
                className={cn(
                  "align-top",
                  historical && "bg-muted/25 text-muted-foreground hover:bg-muted/35"
                )}
              >
                <TableCell className="py-5">
                  <div className="font-semibold">{r.tenantName}</div>
                  {historical && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Kept for history
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-5 text-sm text-muted-foreground">
                  <div>{r.propertyName}</div>
                  <div className="mt-1 font-medium text-foreground">Unit {r.unitNumber}</div>
                </TableCell>
                <TableCell className="py-5 text-sm">{r.month}</TableCell>
                <TableCell className="py-5 text-right font-semibold">{formatRM(r.amount)}</TableCell>
                <TableCell className="py-5 text-sm text-muted-foreground">
                  <div>{formatDate(r.dueDate)}</div>
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex min-w-32 flex-col items-start gap-1.5">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-muted-foreground">
                      {statusHint(r, historical)}
                    </span>
                    {historical && (
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${semanticTone.neutral.badge}`}>
                        History
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  {r.paymentMethod ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {methodIcon[r.paymentMethod]}
                      {r.paymentMethod}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="py-5 text-right">
                  {historical ? (
                    <span className="text-xs text-muted-foreground">Archived</span>
                  ) : r.status === "Paid" ? (
                    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5">
                      <CopyPaymentLinkButton paymentLinkId={r.paymentLinkId} />
                    </div>
                  ) : (
                    <div className="inline-flex flex-wrap items-center justify-end gap-2 rounded-md border border-border bg-muted/30 p-1.5">
                      <CopyPaymentLinkButton paymentLinkId={r.paymentLinkId} />
                      <CopyReminderMessageButton
                        tenantName={r.tenantName}
                        tenantPhone={r.tenantPhone}
                        tenantEmail={r.tenantEmail}
                        month={r.month}
                        amount={r.amount}
                        dueDate={r.dueDate}
                        paymentLinkId={r.paymentLinkId}
                        status={r.status}
                      />
                      {r.status === "Pending" && r.paymentMethod ? (
                        <span className="px-2 text-xs text-muted-foreground">Reviewing</span>
                      ) : (
                        <label
                          className={cn(
                            "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-semibold shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                            submittingId === r.id && "pointer-events-none opacity-50"
                          )}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {submittingId === r.id ? "Uploading..." : "Upload"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="sr-only"
                            disabled={submittingId === r.id}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) {
                                void handleSubmitPayment(r, file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Banknote, CreditCard, Globe, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitPayment } from "@/lib/rent-payments-client";
import { toast } from "sonner";
import type { PaymentMethod, RentRecord, RentStatus } from "@/types";

type FilterTab = "All" | RentStatus;

const TABS: FilterTab[] = ["All", "Paid", "Pending", "Overdue"];

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

export default function RentTable({ records }: { records: RentRecord[] }) {
  const [rentRecords, setRentRecords] = useState(records);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const counts = TABS.reduce<Record<FilterTab, number>>((acc, tab) => {
    acc[tab] =
      tab === "All"
        ? rentRecords.length
        : rentRecords.filter((r) => r.status === tab).length;
    return acc;
  }, {} as Record<FilterTab, number>);

  const filtered =
    activeTab === "All" ? rentRecords : rentRecords.filter((r) => r.status === activeTab);

  // Totals for the active view
  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);

  async function handleSubmitPayment(record: RentRecord, method: PaymentMethod = "Bank Transfer") {
    setSubmittingId(record.id);

    try {
      await submitPayment({
        rentRecordId: record.id,
        tenantId: record.tenantId,
        amount: record.amount,
        date: new Date().toISOString().slice(0, 10),
        method,
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
                    ? "bg-red-100 text-red-700"
                    : tab === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : tab === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
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
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tenant</TableHead>
            <TableHead>Property · Unit</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Action</TableHead>
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
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.tenantName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.propertyName}
                  <span className="text-foreground font-medium"> · {r.unitNumber}</span>
                </TableCell>
                <TableCell className="text-sm">{r.month}</TableCell>
                <TableCell className="font-semibold">{formatRM(r.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(r.dueDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  {r.paymentMethod ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {methodIcon[r.paymentMethod]}
                      {r.paymentMethod}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {r.status === "Paid" ? (
                    <span className="text-xs text-muted-foreground">Settled</span>
                  ) : r.status === "Pending" && r.paymentMethod ? (
                    <span className="text-xs text-muted-foreground">Under review</span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={submittingId === r.id}
                      onClick={() => handleSubmitPayment(r)}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingId === r.id ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

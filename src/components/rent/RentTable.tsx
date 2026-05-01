"use client";

import { useState, type ReactNode } from "react";
import {
  Banknote,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  Mail,
  MessageCircle,
  MoreVertical,
  Upload,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { submitPayment } from "@/lib/rent-payments-client";
import {
  buildReminderMessage,
  buildReminderSubject,
  getActiveRentRecords,
  getHistoricalRentRecords,
  getReminderTiming,
  isSupersededByLaterPaidRecord,
  whatsappPhone,
} from "@/lib/rent-reminders";
import { semanticTone } from "@/lib/color-system";
import { toast } from "sonner";
import type { PaymentMethod, RentRecord, RentStatus } from "@/types";

type FilterTab = "All" | RentStatus | "History";

const TABS: FilterTab[] = ["All", "Paid", "Pending", "Overdue", "History"];

const methodIcon: Record<PaymentMethod, ReactNode> = {
  "Bank Transfer": <CreditCard className="h-3.5 w-3.5" />,
  Cash: <Banknote className="h-3.5 w-3.5" />,
  Online: <Globe className="h-3.5 w-3.5" />,
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
  if (historical) return "Older record";
  if (record.status === "Paid") return "Settled";
  if (record.status === "Pending" && record.paymentMethod) return "Under review";
  if (record.status === "Overdue") return "Needs follow-up";

  return "Awaiting payment";
}

function countBadgeClass(tab: FilterTab) {
  if (tab === "Overdue") return semanticTone.danger.badge;
  if (tab === "Pending") return semanticTone.pending.badge;
  if (tab === "Paid") return semanticTone.success.badge;

  return semanticTone.neutral.badge;
}

function buildPaymentUrl(paymentLinkId: string) {
  return `${window.location.origin}/pay/${paymentLinkId}`;
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
      acc[tab] = activeRecords.filter((record) => record.status === tab).length;
    }

    return acc;
  }, {} as Record<FilterTab, number>);

  const filtered = (() => {
    if (activeTab === "All") return rentRecords;
    if (activeTab === "History") return historyRecords;

    return activeRecords.filter((record) => record.status === activeTab);
  })();

  const totalAmount = filtered.reduce((sum, record) => sum + record.amount, 0);

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
          item.id === record.id
            ? { ...item, status: "Pending", paymentMethod: method }
            : item
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

  async function copyPaymentLink(record: RentRecord) {
    if (!record.paymentLinkId) return;

    await navigator.clipboard.writeText(buildPaymentUrl(record.paymentLinkId));
    toast.success("Payment link copied.");
  }

  function openPaymentLink(record: RentRecord) {
    if (!record.paymentLinkId) return;

    window.open(buildPaymentUrl(record.paymentLinkId), "_blank", "noopener,noreferrer");
  }

  function reminderTiming(record: RentRecord) {
    return getReminderTiming(record) ?? (record.status === "Overdue" ? "Overdue" : "Before Due");
  }

  function getReminderMessage(record: RentRecord) {
    if (!record.paymentLinkId) return "";

    return buildReminderMessage({
      tenantName: record.tenantName,
      month: record.month,
      amount: record.amount,
      dueDate: record.dueDate,
      paymentLinkId: record.paymentLinkId,
      timing: reminderTiming(record),
      origin: window.location.origin,
    });
  }

  async function copyReminder(record: RentRecord) {
    if (!record.paymentLinkId) return;

    await navigator.clipboard.writeText(getReminderMessage(record));
    toast.success("Reminder message copied.");
  }

  function openWhatsApp(record: RentRecord) {
    if (!record.paymentLinkId) return;

    const phone = whatsappPhone(record.tenantPhone);
    const baseUrl = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    window.open(`${baseUrl}?text=${encodeURIComponent(getReminderMessage(record))}`, "_blank", "noopener,noreferrer");
  }

  function openEmail(record: RentRecord) {
    const subject = buildReminderSubject({
      month: record.month,
      timing: reminderTiming(record),
    });
    const href = `mailto:${record.tenantEmail ?? ""}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(getReminderMessage(record))}`;

    window.location.href = href;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit gap-1 rounded-md bg-muted/45 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  activeTab === tab
                    ? countBadgeClass(tab)
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="text-left text-sm sm:text-right">
          <p className="font-semibold text-foreground">{formatRM(totalAmount)}</p>
          <p className="text-xs text-muted-foreground">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {activeTab !== "All" && ` · ${activeTab}`}
          </p>
        </div>
      </div>

      <div className="max-h-[640px] overflow-auto">
        <Table className="min-w-[980px]">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 w-[15%] px-3">Tenant</TableHead>
              <TableHead className="h-10 px-3">Property · Unit</TableHead>
              <TableHead className="h-10 px-3">Period</TableHead>
              <TableHead className="h-10 px-3 text-right">Amount</TableHead>
              <TableHead className="h-10 px-3">Due</TableHead>
              <TableHead className="h-10 px-3">Status</TableHead>
              <TableHead className="h-10 px-3">Method</TableHead>
              <TableHead className="h-10 px-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-left text-muted-foreground">
                  No rent records found for this view.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => {
                const historical = isSupersededByLaterPaidRecord(record, rentRecords);
                const overdue = record.status === "Overdue" && !historical;

                return (
                  <TableRow
                    key={record.id}
                    className={cn(
                      "align-top",
                      overdue &&
                        "bg-red-50/40 hover:bg-red-50/70 dark:bg-red-500/10 dark:hover:bg-red-500/15",
                      historical && "bg-muted/25 text-muted-foreground hover:bg-muted/35"
                    )}
                  >
                    <TableCell className="px-3 py-3.5">
                      <div className="font-semibold">{record.tenantName}</div>
                      {historical && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Kept for history
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-sm text-muted-foreground">
                      <div>{record.propertyName}</div>
                      <div className="mt-1 font-medium text-foreground">
                        Unit {record.unitNumber}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-sm">
                      {record.month}
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-right font-semibold">
                      {formatRM(record.amount)}
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-sm text-muted-foreground">
                      <span className={cn(overdue && "font-semibold text-red-600")}>
                        {formatDate(record.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-3.5">
                      <div className="flex min-w-32 flex-col items-start gap-1.5">
                        <StatusBadge status={record.status} />
                        <span className="text-xs text-muted-foreground">
                          {statusHint(record, historical)}
                        </span>
                        {historical && (
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                              semanticTone.neutral.badge
                            )}
                          >
                            History
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3.5">
                      {record.paymentMethod ? (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {methodIcon[record.paymentMethod]}
                          {record.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-sm italic text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-right">
                      {historical ? (
                        <span className="text-xs text-muted-foreground">Archived</span>
                      ) : (
                        <>
                          <input
                            id={`payment-proof-${record.id}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="sr-only"
                            disabled={submittingId === record.id}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) {
                                void handleSubmitPayment(record, file);
                              }
                            }}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Open actions for ${record.tenantName}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {record.paymentLinkId ? (
                                <>
                                  <DropdownMenuItem onClick={() => void copyPaymentLink(record)}>
                                    <Copy className="h-4 w-4" />
                                    Copy payment link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openPaymentLink(record)}>
                                    <ExternalLink className="h-4 w-4" />
                                    Open payment link
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem disabled>No payment link</DropdownMenuItem>
                              )}

                              {record.status !== "Paid" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    disabled={!record.paymentLinkId}
                                    onClick={() => void copyReminder(record)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    Copy reminder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={!record.paymentLinkId}
                                    onClick={() => openWhatsApp(record)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={!record.paymentLinkId}
                                    onClick={() => openEmail(record)}
                                  >
                                    <Mail className="h-4 w-4" />
                                    Email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {record.status === "Pending" && record.paymentMethod ? (
                                    <DropdownMenuItem disabled>Reviewing payment</DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      disabled={submittingId === record.id}
                                      onSelect={(event) => {
                                        event.preventDefault();
                                        document
                                          .getElementById(`payment-proof-${record.id}`)
                                          ?.click();
                                      }}
                                    >
                                      <Upload className="h-4 w-4" />
                                      {submittingId === record.id ? "Uploading..." : "Upload proof"}
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
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

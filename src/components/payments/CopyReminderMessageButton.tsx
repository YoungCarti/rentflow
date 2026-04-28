"use client";

import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RentStatus } from "@/types";

type CopyReminderMessageButtonProps = {
  tenantName: string;
  month: string;
  amount: number;
  paymentLinkId?: string;
  status: RentStatus;
};

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function monthLabel(month: string) {
  return month.split(" ")[0] ?? month;
}

function buildPaymentUrl(paymentLinkId: string) {
  return `${window.location.origin}/pay/${paymentLinkId}`;
}

export default function CopyReminderMessageButton({
  tenantName,
  month,
  amount,
  paymentLinkId,
  status,
}: CopyReminderMessageButtonProps) {
  if (!paymentLinkId || status === "Paid") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  async function copyReminder() {
    if (!paymentLinkId) return;

    const message = `Hi ${firstName(tenantName)}, your ${monthLabel(month)} rent of ${formatRM(
      amount
    )} is due. You can pay here: ${buildPaymentUrl(paymentLinkId)}`;

    await navigator.clipboard.writeText(message);
    toast.success("Reminder message copied.");
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={copyReminder}>
      <MessageCircle className="h-3.5 w-3.5" />
      Copy reminder
    </Button>
  );
}

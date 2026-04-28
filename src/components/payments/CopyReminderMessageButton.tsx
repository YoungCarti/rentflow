"use client";

import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RentStatus } from "@/types";

type CopyReminderMessageButtonProps = {
  tenantName: string;
  tenantPhone?: string;
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

function buildReminderMessage(input: {
  tenantName: string;
  month: string;
  amount: number;
  paymentLinkId: string;
}) {
  return `Hi ${firstName(input.tenantName)}, your ${monthLabel(input.month)} rent of ${formatRM(
    input.amount
  )} is due. You can pay here: ${buildPaymentUrl(input.paymentLinkId)}`;
}

function whatsappPhone(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.startsWith("0")) {
    return `60${digits.slice(1)}`;
  }

  return digits;
}

export default function CopyReminderMessageButton({
  tenantName,
  tenantPhone,
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

    const message = buildReminderMessage({ tenantName, month, amount, paymentLinkId });

    await navigator.clipboard.writeText(message);
    toast.success("Reminder message copied.");
  }

  function openWhatsApp() {
    if (!paymentLinkId) return;

    const message = buildReminderMessage({ tenantName, month, amount, paymentLinkId });
    const phone = whatsappPhone(tenantPhone);
    const baseUrl = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    window.open(`${baseUrl}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button type="button" variant="ghost" size="sm" onClick={copyReminder}>
        <MessageCircle className="h-3.5 w-3.5" />
        Copy
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={openWhatsApp}>
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </Button>
    </div>
  );
}

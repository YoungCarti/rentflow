"use client";

import { Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RentStatus } from "@/types";
import {
  buildReminderMessage,
  buildReminderSubject,
  getReminderTiming,
  whatsappPhone,
  type RentReminderTiming,
} from "@/lib/rent-reminders";

type CopyReminderMessageButtonProps = {
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  month: string;
  amount: number;
  dueDate: string;
  paymentLinkId?: string;
  status: RentStatus;
  timing?: RentReminderTiming;
  mode?: "full" | "primary";
};

export default function CopyReminderMessageButton({
  tenantName,
  tenantPhone,
  tenantEmail,
  month,
  amount,
  dueDate,
  paymentLinkId,
  status,
  timing,
  mode = "full",
}: CopyReminderMessageButtonProps) {
  if (!paymentLinkId || status === "Paid") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const resolvedTiming =
    timing ??
    getReminderTiming({
      id: "",
      tenantId: "",
      tenantName,
      tenantPhone,
      tenantEmail,
      paymentLinkId,
      propertyName: "",
      unitNumber: "",
      month,
      monthStart: dueDate.slice(0, 7) + "-01",
      amount,
      dueDate,
      status,
      paymentMethod: null,
    }) ??
    "Before Due";

  function getMessage() {
    if (!paymentLinkId) return "";

    return buildReminderMessage({
      tenantName,
      month,
      amount,
      dueDate,
      paymentLinkId,
      timing: resolvedTiming,
      origin: window.location.origin,
    });
  }

  async function copyReminder() {
    if (!paymentLinkId) return;

    await navigator.clipboard.writeText(getMessage());
    toast.success("Reminder message copied.");
  }

  function openWhatsApp() {
    if (!paymentLinkId) return;

    const phone = whatsappPhone(tenantPhone);
    const baseUrl = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    window.open(`${baseUrl}?text=${encodeURIComponent(getMessage())}`, "_blank", "noopener,noreferrer");
  }

  function openEmail() {
    const subject = buildReminderSubject({ month, timing: resolvedTiming });
    const href = `mailto:${tenantEmail ?? ""}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(getMessage())}`;

    window.location.href = href;
  }

  function sendReminder() {
    if (tenantPhone) {
      openWhatsApp();
      return;
    }

    if (tenantEmail) {
      openEmail();
      return;
    }

    void copyReminder();
  }

  if (mode === "primary") {
    return (
      <Button type="button" size="sm" onClick={sendReminder}>
        <MessageCircle className="h-3.5 w-3.5" />
        Send reminder
      </Button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button type="button" variant="ghost" size="sm" onClick={copyReminder}>
        <MessageCircle className="h-3.5 w-3.5" />
        Copy Reminder
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={openWhatsApp}>
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={openEmail}>
        <Mail className="h-3.5 w-3.5" />
        Email
      </Button>
    </div>
  );
}

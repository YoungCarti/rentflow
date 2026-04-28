"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyPaymentLinkButtonProps = {
  paymentLinkId?: string;
  size?: "sm" | "default";
  showOpen?: boolean;
};

function buildPaymentUrl(paymentLinkId: string) {
  return `${window.location.origin}/pay/${paymentLinkId}`;
}

export default function CopyPaymentLinkButton({
  paymentLinkId,
  size = "sm",
  showOpen = false,
}: CopyPaymentLinkButtonProps) {
  if (!paymentLinkId) {
    return <span className="text-xs text-muted-foreground">No link</span>;
  }

  async function copyPaymentLink() {
    if (!paymentLinkId) return;

    await navigator.clipboard.writeText(buildPaymentUrl(paymentLinkId));
    toast.success("Payment link copied.");
  }

  function openPaymentLink() {
    if (!paymentLinkId) return;
    window.open(buildPaymentUrl(paymentLinkId), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button type="button" variant="outline" size={size} onClick={copyPaymentLink}>
        <Copy className="h-3.5 w-3.5" />
        Copy link
      </Button>
      {showOpen && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Open payment link"
          onClick={openPaymentLink}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

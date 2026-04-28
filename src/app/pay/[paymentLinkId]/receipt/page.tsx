import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReceiptActions from "@/components/receipts/ReceiptActions";
import ReceiptDocument from "@/components/receipts/ReceiptDocument";
import { getPublicPaymentReceipt } from "@/lib/receipts";

function ReceiptUnavailable({ paymentLinkId }: { paymentLinkId: string }) {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className="w-full shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <CardTitle>Receipt unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This receipt is available after the current rent payment is completed.
            </p>
            <Button asChild>
              <Link href={`/pay/${paymentLinkId}`}>Return to payment page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default async function PublicReceiptPage({
  params,
}: {
  params: Promise<{ paymentLinkId: string }>;
}) {
  const { paymentLinkId } = await params;
  const receipt = await getPublicPaymentReceipt(paymentLinkId);

  if (!receipt) {
    return <ReceiptUnavailable paymentLinkId={paymentLinkId} />;
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:space-y-0">
        <ReceiptActions />
        <ReceiptDocument receipt={receipt} />
      </div>
    </main>
  );
}

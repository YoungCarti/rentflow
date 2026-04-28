import { notFound } from "next/navigation";
import ReceiptActions from "@/components/receipts/ReceiptActions";
import ReceiptDocument from "@/components/receipts/ReceiptDocument";
import { getPaymentReceipt } from "@/lib/receipts";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const receipt = await getPaymentReceipt(paymentId);

  if (!receipt) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:space-y-0">
      <ReceiptActions />
      <ReceiptDocument receipt={receipt} />
    </div>
  );
}

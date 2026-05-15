import PaymentsBoard from "@/components/payments/PaymentsBoard";
import PageHeader from "@/components/layout/PageHeader";
import { semanticTone } from "@/lib/color-system";
import { getPayments } from "@/lib/rent-payments";

function formatRM(n: number) {
  return `RM ${n.toLocaleString()}`;
}

export default async function PaymentsPage() {
  const payments = await getPayments();
  const online = payments.filter((p) => p.method === "Online");
  const manualProofs = payments.filter(
    (p) => p.method !== "Online" && Boolean(p.proofUrl)
  );
  const pendingProofs = manualProofs.filter((p) => p.status === "Pending");
  const rejected = payments.filter((p) => p.status === "Rejected");

  const totalOnline = online.reduce((s, p) => s + p.amount, 0);
  const totalManualProofs = manualProofs.reduce((s, p) => s + p.amount, 0);
  const totalRejected = rejected.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        summary="Track payment history, receipts, and manual proof reviews"
      />

      <div className="-mx-6 border-y border-border bg-card/35 px-6">
        <div className="grid grid-cols-2 divide-y divide-border lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="min-h-24 px-3 py-4 first:pl-0 lg:first:pl-3">
            <p className="text-xs text-muted-foreground mb-1">Total Payments</p>
            <p className="text-xl font-bold text-foreground">{payments.length}</p>
          </div>
          <div className="min-h-24 px-3 py-4">
            <p className={`mb-1 text-xs ${semanticTone.scheduled.textSoft}`}>Online Payments</p>
            <p className={`text-xl font-bold ${semanticTone.scheduled.text}`}>{online.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.scheduled.textSoft}`}>{formatRM(totalOnline)}</p>
          </div>
          <div className="min-h-24 px-3 py-4">
            <p className={`mb-1 text-xs ${semanticTone.pending.textSoft}`}>Manual Proofs</p>
            <p className={`text-xl font-bold ${semanticTone.pending.text}`}>{manualProofs.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.pending.textSoft}`}>
              {pendingProofs.length} pending · {formatRM(totalManualProofs)}
            </p>
          </div>
          <div className="min-h-24 px-3 py-4">
            <p className={`mb-1 text-xs ${semanticTone.danger.textSoft}`}>Failed / Rejected</p>
            <p className={`text-xl font-bold ${semanticTone.danger.text}`}>{rejected.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.danger.textSoft}`}>{formatRM(totalRejected)}</p>
          </div>
        </div>
      </div>

      <PaymentsBoard payments={payments} />
    </div>
  );
}

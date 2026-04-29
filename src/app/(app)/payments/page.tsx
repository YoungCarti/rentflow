import PaymentsBoard from "@/components/payments/PaymentsBoard";
import PageHeader from "@/components/layout/PageHeader";
import { semanticTone } from "@/lib/color-system";
import { getPayments } from "@/lib/rent-payments";

function formatRM(n: number) {
  return `RM ${n.toLocaleString()}`;
}

export default async function PaymentsPage() {
  const payments = await getPayments();
  const approved = payments.filter((p) => p.status === "Approved");
  const pending  = payments.filter((p) => p.status === "Pending");
  const rejected = payments.filter((p) => p.status === "Rejected");

  const totalApproved = approved.reduce((s, p) => s + p.amount, 0);
  const totalPending  = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        summary="Review submitted payment proofs and update approval status"
      />

      <div className="-mx-6 border-y border-border bg-card/35 px-6">
        <div className="grid grid-cols-2 divide-y divide-border lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="min-h-24 px-3 py-4 first:pl-0 lg:first:pl-3">
            <p className="text-xs text-muted-foreground mb-1">Total Submissions</p>
            <p className="text-xl font-bold text-foreground">{payments.length}</p>
          </div>
          <div className="min-h-24 px-3 py-4">
            <p className={`mb-1 text-xs ${semanticTone.pending.textSoft}`}>Pending Review</p>
            <p className={`text-xl font-bold ${semanticTone.pending.text}`}>{pending.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.pending.textSoft}`}>{formatRM(totalPending)}</p>
          </div>
          <div className="min-h-24 px-3 py-4">
            <p className={`mb-1 text-xs ${semanticTone.success.textSoft}`}>Approved</p>
            <p className={`text-xl font-bold ${semanticTone.success.text}`}>{approved.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.success.textSoft}`}>{formatRM(totalApproved)}</p>
          </div>
          <div className="min-h-24 px-3 py-4">
            <p className={`mb-1 text-xs ${semanticTone.danger.textSoft}`}>Rejected</p>
            <p className={`text-xl font-bold ${semanticTone.danger.text}`}>{rejected.length}</p>
          </div>
        </div>
      </div>

      <PaymentsBoard payments={payments} />
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Submissions</p>
            <p className="text-xl font-bold text-foreground">{payments.length}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${semanticTone.pending.surface}`}>
          <CardContent className="p-4">
            <p className={`mb-1 text-xs ${semanticTone.pending.textSoft}`}>Pending Review</p>
            <p className={`text-xl font-bold ${semanticTone.pending.text}`}>{pending.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.pending.textSoft}`}>{formatRM(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${semanticTone.success.surface}`}>
          <CardContent className="p-4">
            <p className={`mb-1 text-xs ${semanticTone.success.textSoft}`}>Approved</p>
            <p className={`text-xl font-bold ${semanticTone.success.text}`}>{approved.length}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.success.textSoft}`}>{formatRM(totalApproved)}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${semanticTone.danger.surface}`}>
          <CardContent className="p-4">
            <p className={`mb-1 text-xs ${semanticTone.danger.textSoft}`}>Rejected</p>
            <p className={`text-xl font-bold ${semanticTone.danger.text}`}>{rejected.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive board */}
      <PaymentsBoard payments={payments} />
    </div>
  );
}

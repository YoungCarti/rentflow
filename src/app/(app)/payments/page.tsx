import { Card, CardContent } from "@/components/ui/card";
import PaymentsBoard from "@/components/payments/PaymentsBoard";
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review submitted payment proofs and update approval status
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Submissions</p>
            <p className="text-xl font-bold text-foreground">{payments.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100 bg-amber-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 mb-1">Pending Review</p>
            <p className="text-xl font-bold text-amber-700">{pending.length}</p>
            <p className="text-xs text-amber-600 mt-0.5">{formatRM(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-green-100 bg-green-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-green-600 mb-1">Approved</p>
            <p className="text-xl font-bold text-green-700">{approved.length}</p>
            <p className="text-xs text-green-600 mt-0.5">{formatRM(totalApproved)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 bg-red-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 mb-1">Rejected</p>
            <p className="text-xl font-bold text-red-700">{rejected.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive board */}
      <PaymentsBoard payments={payments} />
    </div>
  );
}

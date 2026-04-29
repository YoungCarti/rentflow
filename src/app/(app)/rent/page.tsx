import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RentTable from "@/components/rent/RentTable";
import RentReminderCenter from "@/components/rent/RentReminderCenter";
import { semanticTone } from "@/lib/color-system";
import { getRentRecords } from "@/lib/rent-payments";
import { getActiveRentRecords } from "@/lib/rent-reminders";

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

export default async function RentPage() {
  const rentRecords = await getRentRecords();
  const activeRentRecords = getActiveRentRecords(rentRecords);
  const paid    = activeRentRecords.filter((r) => r.status === "Paid");
  const pending = activeRentRecords.filter((r) => r.status === "Pending");
  const overdue = activeRentRecords.filter((r) => r.status === "Overdue");

  const totalExpected = activeRentRecords.reduce((s, r) => s + r.amount, 0);
  const totalCollected = paid.reduce((s, r) => s + r.amount, 0);
  const totalPending   = pending.reduce((s, r) => s + r.amount, 0);
  const totalOverdue   = overdue.reduce((s, r) => s + r.amount, 0);

  const collectionRate =
    totalExpected === 0 ? 0 : Math.round((totalCollected / totalExpected) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rent Tracking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeRentRecords.length} records · {collectionRate}% collection rate
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Expected</p>
            <p className="text-xl font-bold text-foreground">{formatRM(totalExpected)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activeRentRecords.length} records</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${semanticTone.success.surface}`}>
          <CardContent className="p-4">
            <p className={`mb-1 text-xs ${semanticTone.success.textSoft}`}>Collected</p>
            <p className={`text-xl font-bold ${semanticTone.success.text}`}>{formatRM(totalCollected)}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.success.textSoft}`}>{paid.length} payments</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${semanticTone.pending.surface}`}>
          <CardContent className="p-4">
            <p className={`mb-1 text-xs ${semanticTone.pending.textSoft}`}>Pending</p>
            <p className={`text-xl font-bold ${semanticTone.pending.text}`}>{formatRM(totalPending)}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.pending.textSoft}`}>{pending.length} records</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${semanticTone.danger.surface}`}>
          <CardContent className="p-4">
            <p className={`mb-1 text-xs ${semanticTone.danger.textSoft}`}>Overdue</p>
            <p className={`text-xl font-bold ${semanticTone.danger.text}`}>{formatRM(totalOverdue)}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.danger.textSoft}`}>{overdue.length} records</p>
          </CardContent>
        </Card>
      </div>

      {/* Collection rate bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Collection rate</span>
          <span className="font-semibold text-foreground">{collectionRate}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
          <div
            className={`h-full transition-all ${semanticTone.success.bgStrong}`}
            style={{ width: `${totalExpected === 0 ? 0 : (totalCollected / totalExpected) * 100}%` }}
          />
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${totalExpected === 0 ? 0 : (totalPending / totalExpected) * 100}%` }}
          />
          <div
            className={`h-full transition-all ${semanticTone.danger.bgStrong}`}
            style={{ width: `${totalExpected === 0 ? 0 : (totalOverdue / totalExpected) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className={`inline-block h-2 w-2 rounded-full ${semanticTone.success.bgStrong}`} /> Paid</span>
          <span className="flex items-center gap-1"><span className={`inline-block h-2 w-2 rounded-full ${semanticTone.pending.bgStrong}`} /> Pending</span>
          <span className="flex items-center gap-1"><span className={`inline-block h-2 w-2 rounded-full ${semanticTone.danger.bgStrong}`} /> Overdue</span>
        </div>
      </div>

      <RentReminderCenter records={activeRentRecords} />

      {/* Records table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Rent Records</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RentTable records={rentRecords} />
        </CardContent>
      </Card>
    </div>
  );
}

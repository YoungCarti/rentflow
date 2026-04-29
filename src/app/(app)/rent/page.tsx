import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RentTable from "@/components/rent/RentTable";
import RentReminderCenter from "@/components/rent/RentReminderCenter";
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
        <Card className="shadow-sm border-green-100 bg-green-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-green-600 mb-1">Collected</p>
            <p className="text-xl font-bold text-green-700">{formatRM(totalCollected)}</p>
            <p className="text-xs text-green-600 mt-0.5">{paid.length} payments</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-yellow-100 bg-yellow-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-600 mb-1">Pending</p>
            <p className="text-xl font-bold text-yellow-700">{formatRM(totalPending)}</p>
            <p className="text-xs text-yellow-600 mt-0.5">{pending.length} records</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 bg-red-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 mb-1">Overdue</p>
            <p className="text-xl font-bold text-red-700">{formatRM(totalOverdue)}</p>
            <p className="text-xs text-red-600 mt-0.5">{overdue.length} records</p>
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
            className="h-full bg-green-500 transition-all"
            style={{ width: `${totalExpected === 0 ? 0 : (totalCollected / totalExpected) * 100}%` }}
          />
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${totalExpected === 0 ? 0 : (totalPending / totalExpected) * 100}%` }}
          />
          <div
            className="h-full bg-red-400 transition-all"
            style={{ width: `${totalExpected === 0 ? 0 : (totalOverdue / totalExpected) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Paid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Overdue</span>
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

import RentTrackingWorkspace from "@/components/rent/RentTrackingWorkspace";
import PageHeader from "@/components/layout/PageHeader";
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
      <PageHeader
        title="Rent Tracking"
        summary={`${activeRentRecords.length} records · ${collectionRate}% collection rate`}
      />

      <section className="rounded-lg border border-border bg-card/35">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">This Month Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeRentRecords.length} active rent records
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">Collection rate</p>
            <p className="text-2xl font-bold text-foreground">{collectionRate}%</p>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-y divide-border lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="min-h-24 px-4 py-4">
            <p className="mb-1 text-xs text-muted-foreground">Expected</p>
            <p className="text-xl font-bold text-foreground">{formatRM(totalExpected)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{activeRentRecords.length} records</p>
          </div>
          <div className="min-h-24 px-4 py-4">
            <p className={`mb-1 text-xs ${semanticTone.success.textSoft}`}>Collected</p>
            <p className={`text-xl font-bold ${semanticTone.success.text}`}>{formatRM(totalCollected)}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.success.textSoft}`}>{paid.length} payments</p>
          </div>
          <div className="min-h-24 px-4 py-4">
            <p className={`mb-1 text-xs ${semanticTone.pending.textSoft}`}>Pending</p>
            <p className={`text-xl font-bold ${semanticTone.pending.text}`}>{formatRM(totalPending)}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.pending.textSoft}`}>{pending.length} records</p>
          </div>
          <div className="min-h-24 px-4 py-4">
            <p className={`mb-1 text-xs ${semanticTone.danger.textSoft}`}>Overdue</p>
            <p className={`text-xl font-bold ${semanticTone.danger.text}`}>{formatRM(totalOverdue)}</p>
            <p className={`mt-0.5 text-xs ${semanticTone.danger.textSoft}`}>{overdue.length} records</p>
          </div>
        </div>
        <div className="border-t border-border p-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${semanticTone.success.bgStrong}`}
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </section>

      <RentTrackingWorkspace records={rentRecords} />
    </div>
  );
}

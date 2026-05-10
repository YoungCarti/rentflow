import { redirect } from "next/navigation";
import { CheckCircle2, Home, Wrench } from "lucide-react";
import RentFlowLogo from "@/components/brand/RentFlowLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPublicMaintenanceRequest,
  getPublicRentPayment,
  type PublicRentPayment,
} from "@/lib/public-payments";

function InvalidMaintenanceLink() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className="w-full shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="flex h-11 w-11 items-center justify-center">
              <RentFlowLogo className="h-11 w-11" />
            </div>
            <CardTitle>Maintenance link unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            This maintenance link is invalid or expired. Ask your landlord for a new request link.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function UnitSummary({ payment }: { payment: PublicRentPayment }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Home className="h-4 w-4 text-muted-foreground" />
          Unit Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Tenant</p>
          <p className="font-semibold text-foreground">{payment.tenantName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unit</p>
          <p className="font-semibold text-foreground">Unit {payment.unitNumber}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground">Property</p>
          <p className="font-semibold text-foreground">{payment.propertyName}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PublicMaintenanceReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ paymentLinkId: string }>;
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { paymentLinkId } = await params;
  const { submitted, error } = await searchParams;
  const payment = await getPublicRentPayment(paymentLinkId);

  if (!payment) {
    return <InvalidMaintenanceLink />;
  }

  async function logMaintenance(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "Repairs");
    const priority = String(formData.get("priority") ?? "Medium");

    if (!title) {
      redirect(`/maintenance/report/${paymentLinkId}?error=missing-title`);
    }

    await createPublicMaintenanceRequest(paymentLinkId, {
      title,
      description,
      category,
      priority,
    });

    redirect(`/maintenance/report/${paymentLinkId}?submitted=1`);
  }

  const maintenanceSubmitted = submitted === "1";
  const missingTitle = error === "missing-title";

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center">
        <div className="w-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center">
              <RentFlowLogo className="h-11 w-11" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">RentFlow</p>
              <p className="text-xs text-muted-foreground">Maintenance request</p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Report a Maintenance Issue
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Send your landlord the repair details for your unit.
            </p>
          </div>

          <UnitSummary payment={payment} />

          {maintenanceSubmitted && (
            <Card className="border-green-200 bg-green-50/70 shadow-sm dark:bg-green-500/10 dark:border-green-500/20">
              <CardContent className="flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Maintenance request submitted
                  </p>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                    Your landlord can now review it in RentFlow.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={logMaintenance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-title">Issue</Label>
                  <Input
                    id="maintenance-title"
                    name="title"
                    placeholder="Leaking pipe, faulty light..."
                    aria-invalid={missingTitle}
                    required
                  />
                  {missingTitle && (
                    <p className="text-xs font-medium text-red-600">Please enter the issue title.</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-category">Category</Label>
                    <select
                      id="maintenance-category"
                      name="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                      defaultValue="Repairs"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Repairs">Repairs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-priority">Priority</Label>
                    <select
                      id="maintenance-priority"
                      name="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                      defaultValue="Medium"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-description">Notes</Label>
                  <Input
                    id="maintenance-description"
                    name="description"
                    placeholder="Optional details"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Wrench className="h-4 w-4" />
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

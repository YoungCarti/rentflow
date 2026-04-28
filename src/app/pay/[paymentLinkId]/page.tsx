import { redirect } from "next/navigation";
import { Building2, CheckCircle2, CreditCard, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  getPublicRentPayment,
  markPublicRentPaid,
  type PublicRentPayment,
} from "@/lib/public-payments";

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(dateStr: string) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateStr}T00:00:00`));
}

function InvalidPaymentLink() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className="w-full shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <CardTitle>Payment link unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            This payment link is invalid, expired, or not active for the current rent period.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function PaymentDetails({ payment }: { payment: PublicRentPayment }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Home className="h-4 w-4 text-muted-foreground" />
          Rent Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Tenant</p>
            <p className="font-semibold text-foreground">{payment.tenantName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={payment.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Property</p>
            <p className="font-semibold text-foreground">{payment.propertyName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unit</p>
            <p className="font-semibold text-foreground">Unit {payment.unitNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rent Month</p>
            <p className="font-semibold text-foreground">{formatMonth(payment.monthStart)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="font-semibold text-foreground">{formatDate(payment.dueDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PublicPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ paymentLinkId: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { paymentLinkId } = await params;
  const { paid } = await searchParams;
  const payment = await getPublicRentPayment(paymentLinkId);

  if (!payment) {
    return <InvalidPaymentLink />;
  }

  async function payNow() {
    "use server";
    await markPublicRentPaid(paymentLinkId);
    redirect(`/pay/${paymentLinkId}?paid=1`);
  }

  const successful = paid === "1" || payment.status === "Paid";

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">RentFlow</p>
                <p className="text-xs text-muted-foreground">Secure rent payment page</p>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Monthly Rent Payment
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Review the rent details below and complete this month&apos;s payment.
              </p>
            </div>

            <PaymentDetails payment={payment} />

            {successful && (
              <Card className="border-green-200 bg-green-50/70 shadow-sm dark:bg-green-500/10 dark:border-green-500/20">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Payment successful
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      Your landlord&apos;s RentFlow dashboard has been updated.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          <aside className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Amount Due</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {formatRM(payment.amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {formatDate(payment.dueDate)}
                  </p>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-medium text-foreground">Dummy online</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span className="font-medium text-foreground">RM 0</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold text-foreground">{formatRM(payment.amount)}</span>
                  </div>
                </div>

                {successful ? (
                  <Button className="w-full" disabled>
                    <CheckCircle2 className="h-4 w-4" />
                    Payment Complete
                  </Button>
                ) : (
                  <form action={payNow}>
                    <Button type="submit" className="w-full">
                      <CreditCard className="h-4 w-4" />
                      Pay Now
                    </Button>
                  </form>
                )}

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    This MVP uses dummy payment logic. No real card, bank, or wallet charge is made.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

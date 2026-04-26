import {
  CheckCircle2,
  XCircle,
  Zap,
  CreditCard,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    description: "Everything you need to get started.",
    current: true,
    features: [
      { label: "Up to 3 properties",       included: true },
      { label: "Up to 20 units",           included: true },
      { label: "Tenant management",        included: true },
      { label: "Rent tracking",            included: true },
      { label: "Basic reports",            included: true },
      { label: "Email support",            included: true },
      { label: "Advanced analytics",       included: false },
      { label: "Payment gateway",          included: false },
      { label: "Bulk rent reminders",      included: false },
      { label: "Custom branding",          included: false },
      { label: "Priority support",         included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    description: "For serious landlords managing multiple portfolios.",
    current: false,
    features: [
      { label: "Unlimited properties",     included: true },
      { label: "Unlimited units",          included: true },
      { label: "Tenant management",        included: true },
      { label: "Rent tracking",            included: true },
      { label: "Advanced reports + export",included: true },
      { label: "Email support",            included: true },
      { label: "Advanced analytics",       included: true },
      { label: "Payment gateway",          included: true },
      { label: "Bulk rent reminders",      included: true },
      { label: "Custom branding",          included: true },
      { label: "Priority support",         included: true },
    ],
  },
];

const BILLING = {
  nextDate: "1 May 2026",
  amount: "RM 49.00",
  method: "Visa ending in 4242",
  cycle: "Monthly",
};

// ─── Reusable feature row ─────────────────────────────────────────────────────

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {included ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
      )}
      <span className={included ? "text-foreground" : "text-muted-foreground/60 line-through"}>
        {label}
      </span>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your plan and billing details
        </p>
      </div>

      {/* Current plan banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">Basic Plan</p>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-xs">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Next billing on {BILLING.nextDate} · {BILLING.amount}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-2 shrink-0">
          <Zap className="w-4 h-4 text-amber-500" />
          Upgrade to Pro
        </Button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`shadow-sm relative overflow-hidden ${
              !plan.current
                ? "border-primary ring-1 ring-primary/20"
                : "border-border"
            }`}
          >
            {/* Pro "Most popular" ribbon */}
            {!plan.current && (
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  Recommended
                </span>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  RM {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="font-semibold text-lg text-foreground">{plan.name}</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <FeatureRow key={f.label} label={f.label} included={f.included} />
                ))}
              </ul>

              <div className="pt-2">
                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full gap-2">
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing details */}
      <Card className="shadow-sm max-w-lg">
        <CardHeader className="pb-2">
          <p className="font-semibold text-base text-foreground">Billing Details</p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Billing cycle</span>
            <span className="font-medium">{BILLING.cycle}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Next billing date
            </span>
            <span className="font-medium">{BILLING.nextDate}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Payment method
            </span>
            <span className="font-medium">{BILLING.method}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount due</span>
            <span className="font-bold text-foreground">{BILLING.amount}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              Update Payment Method
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              View Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

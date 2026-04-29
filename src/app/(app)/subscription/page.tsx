import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  Crown,
  Download,
  FileText,
  Headphones,
  KeyRound,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Plan = {
  name: string;
  price: number;
  period: string;
  description: string;
  action: string;
  current?: boolean;
  featured?: boolean;
  featuresTitle?: string;
  features: Array<{
    label: string;
    icon: LucideIcon;
  }>;
};

const plans: Plan[] = [
  {
    name: "Go",
    price: 24,
    period: "MYR / month",
    description: "Keep the essentials organized for a small rental portfolio",
    action: "Switch to Go",
    features: [
      { label: "Core property dashboard", icon: Building2 },
      { label: "Tenant and unit records", icon: Users },
      { label: "Manual rent tracking", icon: ReceiptText },
      { label: "Basic maintenance log", icon: Wrench },
      { label: "Lease expiry reminders", icon: CalendarDays },
    ],
  },
  {
    name: "Plus",
    price: 99,
    period: "MYR / month",
    description: "More access for landlords managing active collections",
    action: "Your current plan",
    current: true,
    features: [
      { label: "Advanced collection dashboard", icon: BarChart3 },
      { label: "More tenants, units, and uploads", icon: UploadCloud },
      { label: "Payment links and proof review", icon: CreditCard },
      { label: "Automated rent reminders", icon: Bell },
      { label: "Receipt generation", icon: FileText },
      { label: "Maintenance cost tracking", icon: Wrench },
      { label: "Monthly report exports", icon: Download },
    ],
  },
  {
    name: "Pro",
    price: 420,
    period: "MYR / month",
    description: "Maximize your property operations",
    action: "Upgrade to Pro",
    featured: true,
    featuresTitle: "Everything in Plus, and:",
    features: [
      { label: "5x more portfolio capacity", icon: Sparkles },
      { label: "Priority payment operations", icon: CreditCard },
      { label: "Custom tenant portal branding", icon: Crown },
      { label: "Unlimited receipt and document storage", icon: FileText },
      { label: "Maximum report exports", icon: Download },
      { label: "Priority support", icon: Headphones },
      { label: "Early access to new workflows", icon: KeyRound },
      { label: "Dedicated onboarding guidance", icon: ShieldCheck },
    ],
  },
];

function FeatureItem({
  label,
  icon: Icon,
  featured = false,
}: {
  label: string;
  icon: LucideIcon;
  featured?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 text-sm leading-5">
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          featured ? "text-violet-700 dark:text-violet-100" : "text-foreground"
        }`}
      />
      <span
        className={
          featured
            ? "font-medium text-violet-950 dark:text-white"
            : "text-foreground"
        }
      >
        {label}
      </span>
    </li>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = Boolean(plan.featured);

  return (
    <section
      className={`flex min-h-[36rem] flex-col rounded-lg border p-5 shadow-sm ${
        featured
          ? "border-violet-400/70 bg-violet-100/80 text-violet-950 shadow-violet-950/5 dark:border-violet-400/45 dark:bg-[#2c214c] dark:text-white"
          : "border-border bg-card text-card-foreground"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-normal">{plan.name}</h2>

        {featured && (
          <div className="inline-flex rounded-full bg-violet-200/80 p-1 text-xs font-semibold text-violet-950 dark:bg-black/25 dark:text-white">
            <span className="rounded-full bg-violet-950 px-4 py-1 text-white dark:bg-white/15">
              5x
            </span>
            <span className="px-4 py-1 text-violet-700 dark:text-white/55">20x</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span
          className={`mb-2 text-base ${
            featured ? "text-violet-700 dark:text-white/55" : "text-muted-foreground"
          }`}
        >
          RM
        </span>
        <span className="text-5xl font-bold leading-none tracking-normal">
          {plan.price}
        </span>
        <span
          className={`mb-1 text-xs font-semibold ${
            featured ? "text-violet-800 dark:text-white" : "text-foreground"
          }`}
        >
          {plan.period}
        </span>
      </div>

      <p
        className={`mt-5 min-h-10 text-sm font-semibold leading-5 ${
          featured ? "text-violet-950 dark:text-white" : "text-foreground"
        }`}
      >
        {plan.description}
      </p>

      <Button
        className={`mt-8 h-10 w-full rounded-full ${
          featured
            ? "border-0 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
            : ""
        }`}
        variant={plan.current ? "outline" : featured ? "default" : "outline"}
        disabled={plan.current}
      >
        {plan.action}
      </Button>

      {plan.featuresTitle && (
        <p className="mt-7 text-sm font-bold text-violet-950 dark:text-white">
          {plan.featuresTitle}
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {plan.features.map((feature) => (
          <FeatureItem
            key={feature.label}
            label={feature.label}
            icon={feature.icon}
            featured={featured}
          />
        ))}
      </ul>

      <div
        className={`mt-auto pt-8 text-xs leading-5 ${
          featured ? "text-violet-800 dark:text-white/80" : "text-muted-foreground"
        }`}
      >
        {featured ? (
          <>
            <p>Unlimited usage subject to plan limits.</p>
            <a className="font-semibold underline underline-offset-2" href="#">
              I need help with billing
            </a>
          </>
        ) : plan.current ? (
          <a className="font-semibold underline underline-offset-2" href="#">
            I need help with billing
          </a>
        ) : (
          <p>This plan may include payment processing fees.</p>
        )}
      </div>
    </section>
  );
}

export default function SubscriptionPage() {
  return (
    <div className="-m-6 min-h-[calc(100vh-4rem)] bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <h1 className="text-center text-2xl font-semibold tracking-normal sm:text-3xl">
          Upgrade your plan
        </h1>

        <div className="mt-6 inline-flex rounded-full border border-border bg-muted p-1">
          <button className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
            Personal
          </button>
          <button className="rounded-full px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            Business
          </button>
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-14 text-center text-sm text-muted-foreground">
          <MessageCircle className="mx-auto mb-3 h-5 w-5 text-foreground" />
          <p>Need more capabilities for your business?</p>
          <a className="font-semibold text-foreground underline underline-offset-2" href="#">
            Talk to RentFlow Enterprise
          </a>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Welcome to RentFlow",
    summary: "Start with the basics so the dashboard has real portfolio data.",
    description:
      "RentFlow works best once you add a property, create units, and assign tenants. After that, rent records, payment links, reminders, and reports can flow from the same setup.",
    icon: Home,
    primaryLabel: "Start setup",
    primaryHref: "/onboarding/property",
    secondaryLabel: "Go to dashboard",
    secondaryHref: "/dashboard",
  },
  {
    id: "property",
    label: "Property",
    title: "Add your first property",
    summary: "Create the property and define its units.",
    description:
      "Properties and units are the foundation for occupancy, rent tracking, and tenant assignments.",
    icon: Building2,
    primaryLabel: "Add property",
    primaryHref: "/properties/new",
    secondaryLabel: "Next",
    secondaryHref: "/onboarding/tenants",
  },
  {
    id: "tenants",
    label: "Tenants",
    title: "Assign tenants",
    summary: "Connect tenants to units and lease dates.",
    description:
      "Tenant records keep contact details, lease periods, and current rent status in one place.",
    icon: Users,
    primaryLabel: "Add tenant",
    primaryHref: "/tenants/new",
    secondaryLabel: "Next",
    secondaryHref: "/onboarding/rent",
  },
  {
    id: "rent",
    label: "Rent",
    title: "Use rent tracking",
    summary: "Create payment links, reminders, and proof review from rent records.",
    description:
      "The rent page is where payment links and reminders belong, so tenants stay focused and the tenant page stays clean.",
    icon: KeyRound,
    primaryLabel: "Open rent page",
    primaryHref: "/rent",
    secondaryLabel: "Finish",
    secondaryHref: "/dashboard",
  },
] as const;

function getStep(step: string) {
  return steps.find((item) => item.id === step);
}

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step: stepParam } = await params;
  const step = getStep(stepParam);

  if (!step) {
    redirect("/onboarding/welcome");
  }

  const currentIndex = steps.findIndex((item) => item.id === step.id);
  const Icon = step.icon;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col justify-center space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">RentFlow</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            Onboarding
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up RentFlow in the right order
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href="/dashboard">Skip for now</Link>
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((item, index) => (
          <Link
            key={item.id}
            href={`/onboarding/${item.id}`}
            className={cn(
              "rounded-md border p-3 text-sm transition-colors",
              item.id === step.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  item.id === step.id
                    ? "bg-background text-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="font-semibold">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="border-y border-border bg-card/45 px-6 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {step.title}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{step.summary}</p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
            {step.description}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href={step.primaryHref}>
                {step.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={step.secondaryHref}>{step.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4" />
        You can return to this setup flow anytime from `/onboarding/welcome`.
      </div>
    </div>
  );
}

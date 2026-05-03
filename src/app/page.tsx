"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  BellRing,
  CalendarDays,
  ChartNoAxesColumn,
  CircleCheck,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FileText,
  LayoutDashboard,
  Link2,
  ReceiptText,
  TrendingUp,
  UserCircle,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import RentFlowLogo from "@/components/brand/RentFlowLogo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Contact Us", href: "#contact" },
];

const heroWords = ["elegance.", "clarity.", "control.", "confidence."];

export default function LandingPage() {
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const previewTiltRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [heroWordIndex, setHeroWordIndex] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const previewFrame = previewFrameRef.current;
    const previewTilt = previewTiltRef.current;
    if (!previewFrame || !previewTilt) return;

    let animationFrame = 0;

    const updatePreviewTilt = () => {
      animationFrame = 0;

      const rect = previewFrame.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.9;
      const end = viewportHeight * 0.35;
      const progress = Math.min(
        Math.max((start - rect.top) / (start - end), 0),
        1,
      );
      const tilt = 13 * (1 - progress);
      const lift = 8 * (1 - progress);

      previewTilt.style.setProperty("--preview-tilt", `${tilt}deg`);
      previewTilt.style.setProperty("--preview-lift", `${lift}px`);
    };

    const schedulePreviewTilt = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updatePreviewTilt);
    };

    updatePreviewTilt();
    window.addEventListener("scroll", schedulePreviewTilt, { passive: true });
    window.addEventListener("resize", schedulePreviewTilt);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", schedulePreviewTilt);
      window.removeEventListener("resize", schedulePreviewTilt);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroWordIndex((currentIndex) => (currentIndex + 1) % heroWords.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col justify-center items-center relative overflow-clip dark">
      <DottedBackground className="absolute inset-0 z-0" />

      <header className="absolute inset-x-0 top-0 z-20 px-4 py-5 sm:px-6 lg:px-10 border-b border-dotted border-white/20 bg-[#0A0A0A]/50 backdrop-blur-md">
        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="flex items-center justify-center gap-2.5 sm:justify-self-start"
            aria-label="RentFlow home"
          >
            <span className="flex h-8 w-8 items-center justify-center">
              <RentFlowLogo className="h-8 w-8" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              RentFlow
            </span>
          </Link>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/60 sm:gap-x-7 sm:text-sm"
            aria-label="Landing page navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white focus-visible:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex justify-center sm:justify-self-end">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#0A0A0A] transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-[#0A0A0A] transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
              >
                Try RentFlow Free
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-col items-center overflow-hidden px-4 pt-36 sm:pt-44">
        <div className="max-w-3xl text-center">
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60"
          >
            Manage properties with{" "}
            <span className="relative inline-grid text-left align-baseline text-cyan-200 italic">
              {heroWords.map((word, index) => (
                <span
                  key={word}
                  className={`col-start-1 row-start-1 w-max justify-self-center whitespace-nowrap rounded-lg bg-cyan-300/10 px-2 transition-[opacity,transform,filter] duration-300 ease-out ${heroWordIndex === index
                    ? "translate-y-0 opacity-100 blur-0"
                    : "translate-y-3 opacity-0 blur-sm"
                    }`}
                  aria-hidden={heroWordIndex !== index}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light"
          >
            RentFlow provides the most premium, seamless experience for landlords and property managers to oversee their portfolios in real-time.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-in"}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              <span className="relative z-10">
                {isAuthenticated ? "Go to Dashboard" : "Sign In to Dashboard"}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href={isAuthenticated ? "/settings?section=account" : "/register"}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              {isAuthenticated && <UserCircle className="h-4 w-4" />}
              {isAuthenticated ? "Account Settings" : "Create an Account"}
            </Link>
          </div>
        </div>

        <div
          ref={previewFrameRef}
          className="mt-20 hidden w-full max-w-6xl px-2 [perspective:1400px] sm:mt-24 md:block"
        >
          <div
            ref={previewTiltRef}
            className="origin-top [--preview-lift:8px] [--preview-tilt:13deg] [transform:rotateX(var(--preview-tilt))_translateY(var(--preview-lift))] [transform-style:preserve-3d]"
          >
            <DashboardPreviewImage />
          </div>
        </div>
      </main>
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

function DashboardPreviewImage() {
  return (
    <div className="relative h-[clamp(360px,44vw,520px)] overflow-hidden rounded-t-2xl border-x border-t border-white/15 bg-white/[0.055] shadow-[0_30px_80px_rgba(0,0,0,0.52),0_80px_160px_rgba(8,145,178,0.14)] ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-white/12 to-transparent" />
      <Image
        src="/dashboard-preview.png"
        alt="RentFlow dashboard preview"
        width={1898}
        height={993}
        className="block h-auto w-full"
        priority
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-[#0A0A0A]/90 sm:h-16" />
    </div>
  );
}

function DottedBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none opacity-[0.11] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "5px 5px",
      }}
    />
  );
}

function FeaturesSection() {
  const featureCards = [
    {
      title: "Smart rental workflow",
      description:
        "Manage properties, tenants, rent, and maintenance from one dashboard.",
      highlight: "One workspace",
      icon: ClipboardList,
      visual: "workflow",
      imageSlot: "smart-rental-workflow",
    },
    {
      title: "Public payment links",
      description:
        "Send tenants a payment link without requiring them to create an account.",
      highlight: "Faster collection",
      icon: CreditCard,
      visual: "payments",
      imageSlot: "public-payment-links",
    },
    {
      title: "Calendar and reminders",
      description:
        "Track rent due dates, lease expiries, inspections, and maintenance events.",
      icon: CalendarDays,
      visual: "calendar",
      imageSlot: "calendar-and-reminders",
    },
    {
      title: "Maintenance tracking",
      description:
        "Log issues, assign priority, update status, and track repair costs.",
      icon: Wrench,
      visual: "maintenance",
      imageSlot: "maintenance-tracking",
    },
    {
      title: "Reports and insights",
      description:
        "View occupancy, revenue, overdue rent, and portfolio performance.",
      icon: ChartNoAxesColumn,
      visual: "reports",
      imageSlot: "reports-and-insights",
    },
  ];

  return (
    <section
      id="features"
      className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6"
    >
      <DottedBackground className="absolute inset-0" />
      <div className="relative mx-auto max-w-6xl space-y-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <FeatureImageSlot
            name="property-tenant-management"
            className="aspect-[1.0/1]"
          />
          <FeatureCopy
            label="Property Management"
            title="Keep every property and tenant organized"
            description="Create properties, add units, assign tenants, and keep lease details, rent status, and contact information in one focused workspace."
            cta="Explore features"
            href="#features-grid"
            pillLayout="columns"
            pills={[
              { label: "Properties", icon: Building2 },
              { label: "Units", icon: DoorOpen },
              { label: "Tenants", icon: UsersRound },
              { label: "Lease details", icon: FileText },
            ]}
          />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <FeatureCopy
            label="Rent Management"
            title="Track rent, payments, and overdue balances with clarity"
            description="Monitor monthly rent records, collection rates, payment links, pending proofs, and overdue tenants without relying on spreadsheets or scattered messages."
            cta="Try RentFlow free"
            href="/register"
            pillLayout="columns"
            pills={[
              { label: "Rent tracking", icon: ReceiptText },
              { label: "Payment links", icon: Link2 },
              { label: "Reminders", icon: BellRing },
              { label: "Reports", icon: TrendingUp },
            ]}
          />
          <FeatureImageSlot
            name="rent-tracking-payments"
            className="aspect-[1.04/1]"
          />
        </div>

        <div id="features-grid" className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Built for landlords, powered by simplicity
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {featureCards.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#151515] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.26)] transition-colors hover:border-white/18 ${
                index < 2
                  ? "min-h-[390px] md:col-span-2 lg:col-span-3"
                  : "min-h-[285px] lg:col-span-2"
              }`}
            >
              {index < 2 ? (
                <FeatureShowcaseCard
                  title={feature.title}
                  description={feature.description}
                  highlight={feature.highlight}
                  visual={feature.visual}
                  imageSlot={feature.imageSlot}
                />
              ) : (
                <FeatureMiniCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  visual={feature.visual}
                  imageSlot={feature.imageSlot}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const pricingPlans = [
    {
      name: "Starter",
      price: "RM0",
      description:
        "Perfect for getting started with essential tools for a small rental portfolio.",
      cta: "Start for Free",
      href: "/register",
      features: [
        "Manage up to 3 properties",
        "Track tenants and units",
        "Basic rent records",
      ],
    },
    {
      name: "Lifetime",
      price: "RM299",
      suffix: "one-time",
      description:
        "Unlock RentFlow for good with advanced tools for tenants, payments, and portfolio workflows.",
      cta: "Get Lifetime",
      href: "/register",
      popular: true,
      features: [
        "Unlimited properties and units",
        "Payment links and proof review",
        "Calendar and rent reminders",
        "Maintenance tracking",
        "Reports and insights",
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6"
    >
      <DottedBackground className="absolute inset-0" />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm text-white/45">
            <span className="h-2 w-2 rounded-full bg-white/25" />
            Pricing
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Choose the plan that{" "}
            <span className="text-white/[0.42]">matches your ambition</span>
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-3 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex min-h-[450px] flex-col border border-white/[0.12] bg-[#0B0B0B]/70 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)]"
            >
              {plan.popular ? (
                <span className="absolute right-6 top-6 rounded-full border border-white/[0.12] px-3 py-1 text-xs font-medium text-white/70">
                  Popular
                </span>
              ) : null}

              <h3 className="text-xl font-semibold text-white/[0.88]">
                {plan.name}
              </h3>
              <div className="mt-7 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">
                  {plan.price}
                </span>
                {plan.suffix ? (
                  <span className="pb-1 text-sm text-white/48">
                    {plan.suffix}
                  </span>
                ) : null}
              </div>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/[0.42]">
                {plan.description}
              </p>

              <Link
                href={plan.href}
                className={`mt-7 inline-flex h-11 w-fit items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-white text-[#0A0A0A] hover:bg-white/90"
                    : "text-white/[0.86] hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>

              <div className="my-9 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs text-white/38">
                <span className="h-px bg-white/10" />
                Features
                <span className="h-px bg-white/10" />
              </div>

              <ul className="space-y-4 text-sm text-white/48">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/[0.72]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcaseCard({
  title,
  description,
  highlight,
  visual,
  imageSlot,
}: {
  title: string;
  description: string;
  highlight?: string;
  visual: string;
  imageSlot: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-8">
      <h3 className="max-w-md text-2xl font-bold leading-tight tracking-tight text-white">
        {title}
      </h3>
      <FeatureCardVisual imageSlot={imageSlot} visual={visual} size="large" />
      <p className="text-sm leading-6 text-white/[0.62]">
        {highlight ? (
          <span className="font-semibold text-white/85">{highlight}. </span>
        ) : null}
        {description}
      </p>
    </div>
  );
}

function FeatureMiniCard({
  title,
  description,
  icon: Icon,
  visual,
  imageSlot,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  visual: string;
  imageSlot: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-7">
      <div className="space-y-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <FeatureCardVisual imageSlot={imageSlot} visual={visual} size="small" />
      <div>
        <p className="text-sm leading-6 text-white/[0.58]">{description}</p>
      </div>
    </div>
  );
}

function FeatureCardVisual({
  imageSlot,
  visual,
  size,
}: {
  imageSlot: string;
  visual: string;
  size: "large" | "small";
}) {
  return (
    <div
      aria-label={`${imageSlot} image slot`}
      data-feature-image-slot={imageSlot}
      data-feature-visual={visual}
      className={`relative overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-br from-sky-200 via-[#f7f2ea] to-amber-100 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${
        size === "large" ? "aspect-[1.7/1]" : "aspect-[1.55/1]"
      }`}
    />
  );
}

function FeatureImageSlot({
  name,
  compact = false,
  className = "aspect-[1.65/1]",
}: {
  name: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-label={`${name} image slot`}
      data-image-slot={name}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200 via-[#f7f2ea] to-amber-100 shadow-[0_22px_70px_rgba(0,0,0,0.26)] ${compact ? "aspect-[1.85/1] rounded-2xl shadow-none" : className
        }`}
    />
  );
}

function FeatureCopy({
  label,
  title,
  description,
  cta,
  href,
  pills,
  pillLayout = "wrap",
}: {
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  pills: Array<string | { label: string; icon?: LucideIcon }>;
  pillLayout?: "wrap" | "columns";
}) {
  const pillItems = pills.map((pill) =>
    typeof pill === "string" ? { label: pill } : pill,
  );

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-base leading-7 text-white/[0.58]">
        {description}
      </p>
      <Link
        href={href}
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-white/90"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <div
        className={`mt-8 gap-3 ${
          pillLayout === "columns"
            ? "grid w-full max-w-[420px] grid-flow-col grid-rows-2 gap-x-4 gap-y-4 [grid-auto-columns:minmax(0,1fr)]"
            : "flex flex-wrap"
        }`}
      >
        {pillItems.map(({ label: pill, icon: Icon }) => (
          <span
            key={pill}
            className={`inline-flex items-center justify-center gap-3 rounded-full border text-sm font-medium ${
              pillLayout === "columns"
                ? "h-12 border-white/10 bg-white/[0.045] px-5 text-white/70"
                : "border-white/10 bg-white/[0.045] px-4 py-2 text-white/70"
            }`}
          >
            {Icon ? <Icon className="h-4 w-4 text-white/55" /> : null}
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

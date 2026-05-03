"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Building2,
  BellRing,
  CalendarDays,
  ChartNoAxesColumn,
  CircleCheck,
  CloudCheck,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FileText,
  Flame,
  LayoutDashboard,
  Link2,
  Plus,
  ReceiptText,
  Search,
  Table2,
  TrendingUp,
  TriangleAlert,
  UserCircle,
  UserPlus,
  UsersRound,
  Wrench,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import RentFlowLogo from "@/components/brand/RentFlowLogo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Contact Us", href: "#contact" },
];

const heroWords = ["elegance.", "clarity.", "control.", "confidence."];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const cardMotion: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const viewportOnce = { once: true, amount: 0.22 };

export default function LandingPage() {
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const previewTiltRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

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

  useEffect(() => {
    const updateHeaderState = () => {
      setHasScrolled(window.scrollY > 24);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col justify-center items-center relative overflow-clip dark">
      <DottedBackground className="absolute inset-0 z-0" />

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          hasScrolled
            ? "border-b border-white/10 bg-[#0A0A0A]/82 px-4 py-3 shadow-[0_14px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-6 lg:px-10"
            : "border-b border-dotted border-white/20 bg-[#0A0A0A]/50 px-4 py-5 backdrop-blur-md sm:px-6 lg:px-10"
        }`}
      >
        <div
          className="grid w-full grid-cols-1 items-center gap-4 transition-all duration-300 sm:grid-cols-[1fr_auto_1fr]"
        >
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
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-white/90"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-white/90"
                >
                  Try RentFlow Free
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex w-full flex-col items-center overflow-hidden px-4 pt-36 sm:pt-44">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl text-center"
        >
          <motion.h1
            variants={fadeUp}
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
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light"
          >
            RentFlow provides the most premium, seamless experience for landlords and property managers to oversee their portfolios in real-time.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={isAuthenticated ? "/dashboard" : "/sign-in"}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium rounded-full overflow-hidden transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              >
                <span className="relative z-10">
                  {isAuthenticated ? "Go to Dashboard" : "Sign In to Dashboard"}
                </span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={isAuthenticated ? "/settings?section=account" : "/register"}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-full transition-colors hover:bg-white/10"
              >
                {isAuthenticated && <UserCircle className="h-4 w-4" />}
                {isAuthenticated ? "Account Settings" : "Create an Account"}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          ref={previewFrameRef}
          initial={{ opacity: 0, y: 38, scale: 0.96, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.85, ease: "easeOut", delay: 0.25 }}
          className="mt-20 hidden w-full max-w-6xl px-2 [perspective:1400px] sm:mt-24 md:block"
        >
          <div
            ref={previewTiltRef}
            className="origin-top [--preview-lift:8px] [--preview-tilt:13deg] [transform:rotateX(var(--preview-tilt))_translateY(var(--preview-lift))] [transform-style:preserve-3d]"
          >
            <DashboardPreviewImage />
          </div>
        </motion.div>
      </main>
      <HowItWorksSection />
      <FeaturesSection />
      <ComparisonSection />
      <PricingSection />
      <BlogSection />
      <CommunitySection />
      <FaqSection />
      <FooterSection />
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

function HowItWorksSection() {
  const steps = [
    {
      title: "Add properties",
      description:
        "Create each property, add units, and keep the details organized from the start.",
      icon: Building2,
      imageSlot: "how-it-works-add-properties",
    },
    {
      title: "Assign tenants",
      description:
        "Connect tenants to the right units with lease details and contact information.",
      icon: UserPlus,
      imageSlot: "how-it-works-assign-tenants",
    },
    {
      title: "Track rent & maintenance",
      description:
        "Monitor rent records, payment status, reminders, and maintenance work in one place.",
      icon: ClipboardCheck,
      imageSlot: "how-it-works-track-rent-maintenance",
    },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-20 text-white sm:px-6">
      <DottedBackground className="absolute inset-0" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            How it works
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            From setup to control in three steps
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative mx-auto mt-12 grid max-w-5xl gap-8"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white/10 lg:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isRight = index % 2 === 1;

            return (
              <motion.div
                key={step.title}
                variants={cardMotion}
                whileHover={{
                  y: -6,
                  borderColor: "rgba(255,255,255,0.2)",
                  transition: { duration: 0.22 },
                }}
                className={`relative grid gap-4 lg:w-[calc(50%-2rem)] ${
                  isRight ? "lg:ml-auto" : "lg:mr-auto"
                }`}
              >
                <span
                  className={`absolute top-8 z-10 hidden h-4 w-4 rounded-full border border-white/20 bg-white lg:block ${
                    isRight ? "-left-10" : "-right-10"
                  }`}
                />

                <div className="rounded-[22px] border border-white/10 bg-[#151515] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.24)]">
                  <div
                    aria-label={`${step.imageSlot} image slot`}
                    data-how-it-works-image-slot={step.imageSlot}
                    className="aspect-[1.72/1] overflow-hidden rounded-[18px] bg-gradient-to-br from-sky-200 via-[#f7f2ea] to-amber-100"
                  />

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0A0A0A]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-white/30">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/[0.58]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/55"
        >
          <span>Add properties</span>
          <ArrowRight className="h-4 w-4 text-white/32" />
          <span>Assign tenants</span>
          <ArrowRight className="h-4 w-4 text-white/32" />
          <span>Track rent & maintenance</span>
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const spreadsheetItems = [
    "Manual updates across tabs",
    "Scattered tenant and rent notes",
    "Easy to miss overdue records",
  ];
  const rentFlowItems = [
    "Structured property workflows",
    "Searchable tenant and payment records",
    "Automated tracking for rent and maintenance",
  ];
  const comparisonCards = [
    {
      label: "Manual",
      title: "Spreadsheets need constant cleanup",
      icon: TriangleAlert,
      tone: "text-white/50",
    },
    {
      label: "Structured",
      title: "RentFlow keeps records connected",
      icon: Workflow,
      tone: "text-white",
    },
    {
      label: "Searchable",
      title: "Find tenants, units, and rent status faster",
      icon: Search,
      tone: "text-white",
    },
    {
      label: "Automated",
      title: "Payment proof and maintenance stay trackable",
      icon: CloudCheck,
      tone: "text-white",
    },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6">
      <DottedBackground className="absolute inset-0" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            Comparison
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            RentFlow vs spreadsheets
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/[0.58]">
            Spreadsheets are manual, scattered, and error-prone. RentFlow is
            structured, searchable, and built for repeatable property workflows.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr]"
        >
          <ComparisonPanel
            title="Spreadsheets"
            description="Flexible at first, but harder to trust as your portfolio grows."
            icon={Table2}
            items={spreadsheetItems}
            type="negative"
          />

          <motion.div
            variants={cardMotion}
            className="flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-sm font-bold uppercase text-white/55 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              vs
            </span>
          </motion.div>

          <ComparisonPanel
            title="RentFlow"
            description="Purpose-built to keep rental operations organized and easier to act on."
            icon={RentFlowLogo}
            items={rentFlowItems}
            type="positive"
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {comparisonCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                variants={cardMotion}
                whileHover={{
                  y: -5,
                  borderColor: "rgba(255,255,255,0.2)",
                  transition: { duration: 0.22 },
                }}
                className="rounded-[18px] border border-white/10 bg-[#151515] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A0A0A]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                    {card.label}
                  </span>
                </div>
                <p className={`mt-6 text-sm font-semibold leading-6 ${card.tone}`}>
                  {card.title}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonPanel({
  title,
  description,
  icon: Icon,
  items,
  type,
}: {
  title: string;
  description: string;
  icon: LucideIcon | typeof RentFlowLogo;
  items: string[];
  type: "negative" | "positive";
}) {
  const isPositive = type === "positive";

  return (
    <motion.div
      variants={cardMotion}
      whileHover={{
        y: -6,
        borderColor: "rgba(255,255,255,0.2)",
        transition: { duration: 0.22 },
      }}
      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#151515] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.26)]"
    >
      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isPositive
                ? "bg-white text-[#0A0A0A]"
                : "border border-white/10 bg-white/[0.055] text-white/62"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">
            {isPositive ? "Organized" : "Risky"}
          </span>
        </div>

        <h3 className="mt-7 text-2xl font-bold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/[0.58]">
          {description}
        </p>

        <div className="mt-7 space-y-4">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 text-sm text-white/62"
            >
              {isPositive ? (
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/75" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
              )}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
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
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]"
        >
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
        </motion.div>

        <motion.div
          id="features-grid"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Built for landlords, powered by simplicity
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-6"
        >
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardMotion}
              whileHover={{
                y: -6,
                borderColor: "rgba(255,255,255,0.18)",
                transition: { duration: 0.22 },
              }}
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
            </motion.div>
          ))}
        </motion.div>

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
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            Pricing
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Choose the plan that{" "}
            <span className="text-white/[0.42]">matches your ambition</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-10 grid max-w-4xl gap-3 md:grid-cols-2"
        >
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardMotion}
              whileHover={{
                y: -6,
                borderColor: "rgba(255,255,255,0.2)",
                transition: { duration: 0.22 },
              }}
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

              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
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
              </motion.div>

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
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-7 max-w-md text-center text-sm leading-6 text-white/[0.46]"
        >
          Start free today. Upgrade only when your portfolio grows.
        </motion.p>
      </div>
    </section>
  );
}

function BlogSection() {
  const blogPosts = [
    {
      title: "Top 10 tools for smarter property management",
      tag: "Tools",
      tagClass: "bg-[#0066CC] text-white",
      visual: "tools",
    },
    {
      title: "A complete guide to rent collection in 2026",
      tag: "Insight",
      tagClass: "bg-[#D99000] text-white",
      visual: "collection",
    },
    {
      title: "What landlords should track every month",
      tag: "Management",
      tagClass: "bg-[#00A866] text-white",
      visual: "tracking",
    },
  ];

  return (
    <section
      id="blog"
      className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6"
    >
      <DottedBackground className="absolute inset-0" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative mx-auto max-w-3xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
          Blog
        </p>
        <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Ideas to level-up
          <br />
          your rental business
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative mx-auto mt-10 max-w-3xl"
      >
        <motion.article
          variants={cardMotion}
          whileHover={{ y: -6, transition: { duration: 0.22 } }}
          className="grid overflow-hidden rounded-lg border border-white/10 bg-[#151515] p-1.5 shadow-[0_22px_70px_rgba(0,0,0,0.26)] md:grid-cols-[1.05fr_1fr]"
        >
          <BlogImage visual="featured" className="min-h-[310px]" />
          <div className="flex min-h-[310px] flex-col justify-between p-6 sm:p-8">
            <div>
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase text-white/80">
                Must read
              </span>
              <h3 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-tight">
                How to organize rental income without spreadsheets
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/[0.58]">
                Learn how to keep rent records, payment links, and monthly
                reports clean from day one.
              </p>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="block h-8 w-8 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFE3C7_0_28%,#B96F56_29%_55%,#34201C_56%_100%)]" />
                <div>
                  <p className="text-xs font-bold">RentFlow Team</p>
                  <p className="text-[11px] text-white/45">
                    Property operations
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F04438] px-3 py-1.5 text-[10px] font-bold uppercase text-white">
                Featured
              </span>
            </div>
          </div>
        </motion.article>

        <motion.div variants={staggerContainer} className="mt-4 grid gap-4 md:grid-cols-3">
          {blogPosts.map((post) => (
            <motion.article
              key={post.title}
              variants={cardMotion}
              whileHover={{ y: -5, transition: { duration: 0.22 } }}
            >
              <BlogImage visual={post.visual} className="aspect-[1.28/1]" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold leading-5 text-white">
                  {post.title}
                </h3>
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase ${post.tagClass}`}
                >
                  {post.tag}
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function BlogImage({
  visual,
  className = "",
}: {
  visual: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      aria-label={`${visual} blog image slot`}
      data-blog-image-slot={visual}
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-sky-200 via-[#f7f2ea] to-amber-100 ${className}`}
    />
  );
}

function CommunitySection() {
  return (
    <section className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6">
      <DottedBackground className="absolute inset-0" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative mx-auto max-w-3xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
          Community
        </p>
        <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Stay in the loop
        </h2>
      </motion.div>

      <motion.div
        variants={cardMotion}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        whileHover={{ y: -6, transition: { duration: 0.22 } }}
        className="relative mx-auto mt-10 max-w-md"
      >
        <article className="rounded-[18px] border border-white/10 bg-[#151515] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.26)]">
          <div className="flex items-start justify-between gap-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5865F2] text-white">
              <DiscordLogo className="h-6 w-6" />
            </span>
            <span className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-white/45">
              Discord
            </span>
          </div>

          <h3 className="mt-7 text-2xl font-bold tracking-tight">Discord</h3>
          <p className="mt-3 text-sm leading-6 text-white/[0.58]">
            Join the RentFlow community for product updates, landlord workflow
            tips, and early feedback on upcoming features.
          </p>

          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-white/82 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Join Discord
            </Link>
          </motion.div>
        </article>
      </motion.div>
    </section>
  );
}

function DiscordLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a.08.08 0 0 0-.09.04c-.21.38-.45.88-.62 1.27a18.3 18.3 0 0 0-5.5 0 12.9 12.9 0 0 0-.63-1.27.08.08 0 0 0-.09-.04 19.7 19.7 0 0 0-4.96 1.57.07.07 0 0 0-.03.03C.29 9.1-.57 13.7-.14 18.24c0 .02.01.04.03.05a19.9 19.9 0 0 0 6.09 3.07.09.09 0 0 0 .1-.03c.47-.64.89-1.31 1.25-2.02a.08.08 0 0 0-.04-.11 13 13 0 0 1-1.9-.9.08.08 0 0 1-.01-.13l.37-.29a.08.08 0 0 1 .08-.01c3.96 1.81 8.25 1.81 12.16 0a.08.08 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.36-1.23.66-1.9.9a.08.08 0 0 0-.04.11c.37.71.79 1.38 1.25 2.02.02.03.06.04.1.03a19.8 19.8 0 0 0 6.09-3.07.08.08 0 0 0 .03-.05c.5-5.25-.84-9.81-3.61-13.84a.06.06 0 0 0-.04-.03ZM7.87 15.48c-1.2 0-2.18-1.1-2.18-2.45s.96-2.45 2.18-2.45c1.23 0 2.2 1.11 2.18 2.45 0 1.35-.96 2.45-2.18 2.45Zm8.25 0c-1.2 0-2.18-1.1-2.18-2.45s.96-2.45 2.18-2.45c1.23 0 2.2 1.11 2.18 2.45 0 1.35-.96 2.45-2.18 2.45Z" />
    </svg>
  );
}

function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    {
      question: "What is RentFlow designed for?",
      answer:
        "RentFlow helps landlords manage properties, units, tenants, rent records, payments, reminders, maintenance, and reports in one focused workspace.",
    },
    {
      question: "Is there a free plan available?",
      answer:
        "Yes. The Starter plan is free and gives you the essentials for a small rental portfolio.",
    },
    {
      question: "Can I use RentFlow for multiple properties?",
      answer:
        "Yes. The Lifetime plan is built for managing unlimited properties and units as your portfolio grows.",
    },
    {
      question: "Can tenants pay without creating an account?",
      answer:
        "Yes. You can send public payment links so tenants can submit payments or proof without signing into RentFlow.",
    },
    {
      question: "Does RentFlow track maintenance requests?",
      answer:
        "Yes. You can log maintenance issues, assign priority, update status, and keep repair costs connected to the right property.",
    },
    {
      question: "Will I still get reports and insights?",
      answer:
        "Yes. RentFlow includes reports for rent collection, overdue balances, occupancy, and portfolio performance.",
    },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6">
      <DottedBackground className="absolute inset-0" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            FAQ
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Your questions,{" "}
            <span className="text-white/[0.42]">answered with clarity</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-10 grid gap-4 lg:grid-cols-2 lg:items-start"
        >
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <motion.div
                key={faq.question}
                layout
                variants={cardMotion}
                whileHover={{
                  borderColor: "rgba(255,255,255,0.2)",
                  transition: { duration: 0.22 },
                }}
                className="border border-white/[0.12] bg-[#0B0B0B]/70"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-white/[0.88]">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <X className="h-4 w-4 shrink-0 text-white/62" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-white/62" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.p
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden px-5 pb-5 text-sm leading-6 text-white/[0.46]"
                    >
                      {faq.answer}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  const pageLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "#blog" },
  ];
  const infoLinks = [
    { label: "Contact", href: "#contact" },
    { label: "Privacy", href: "#" },
    { label: "Terms of use", href: "#" },
    { label: "404", href: "/not-found" },
  ];

  return (
    <section
      id="contact"
      className="relative z-20 w-full overflow-hidden border-t border-dotted border-white/20 bg-[#0A0A0A] px-4 py-24 text-white sm:px-6"
    >
      <DottedBackground className="absolute inset-0" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to get started
          </h2>
          <p className="mt-4 text-sm text-white/[0.58]">
            Start managing your properties with RentFlow. No credit card
            required.
          </p>
          <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-white/90"
            >
              Try RentFlow free
            </Link>
          </motion.div>
        </motion.div>

        <motion.footer
          variants={cardMotion}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          whileHover={{ y: -5, transition: { duration: 0.22 } }}
          className="mx-auto mt-20 max-w-3xl rounded-[22px] border border-white/10 bg-[#151515] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.26)] sm:p-7"
        >
          <div className="grid gap-10 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold"
                aria-label="RentFlow home"
              >
                <RentFlowLogo className="h-5 w-5" />
                RentFlow
              </Link>
              <p className="mt-4 max-w-[210px] text-sm leading-6 text-white/[0.58]">
                A focused property management workspace built for landlords and
                growing rental portfolios.
              </p>

              <div className="mt-5 flex gap-3">
                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0A0A0A] transition-colors hover:bg-white/90"
                    aria-label="RentFlow LinkedIn"
                  >
                    <LinkedInLogo className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0A0A0A] transition-colors hover:bg-white/90"
                    aria-label="RentFlow X"
                  >
                    <XLogo className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>

            <FooterLinkGroup title="Pages" links={pageLinks} />
            <FooterLinkGroup title="Information" links={infoLinks} />
          </div>

          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-3 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 RentFlow. Created by RentFlow.</p>
              <p className="inline-flex items-center gap-1.5">
                Built with <Flame className="h-3.5 w-3.5 text-white/60" /> care
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-white/82">
        {title}
      </h3>
      <div className="mt-4 space-y-4">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block text-sm text-white/[0.58] transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function LinkedInLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.27 8h4.46v15H.27V8Zm7.23 0h4.27v2.05h.06c.6-1.13 2.05-2.32 4.22-2.32 4.51 0 5.34 2.97 5.34 6.83V23h-4.45v-7.49c0-1.79-.03-4.08-2.49-4.08-2.49 0-2.87 1.94-2.87 3.95V23H7.5V8Z" />
    </svg>
  );
}

function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.29l13.32 17.41Z" />
    </svg>
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
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
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
    <motion.div variants={fadeUp}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-base leading-7 text-white/[0.58]">
        {description}
      </p>
      <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Link
          href={href}
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-white/90"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <div
        className={`mt-8 gap-3 ${
          pillLayout === "columns"
            ? "grid w-full max-w-[420px] grid-flow-col grid-rows-2 gap-x-4 gap-y-4 [grid-auto-columns:minmax(0,1fr)]"
            : "flex flex-wrap"
        }`}
      >
        {pillItems.map(({ label: pill, icon: Icon }) => (
          <motion.span
            key={pill}
            whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.075)" }}
            className={`inline-flex items-center justify-center gap-3 rounded-full border text-sm font-medium ${
              pillLayout === "columns"
                ? "h-12 border-white/10 bg-white/[0.045] px-5 text-white/70"
                : "border-white/10 bg-white/[0.045] px-4 py-2 text-white/70"
            }`}
          >
            {Icon ? <Icon className="h-4 w-4 text-white/55" /> : null}
            {pill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

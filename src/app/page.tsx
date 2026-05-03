"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, LayoutDashboard, UserCircle } from "lucide-react";
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
    const preview = previewTiltRef.current;
    if (!preview) return;

    let animationFrame = 0;

    const updatePreviewTilt = () => {
      animationFrame = 0;

      const rect = preview.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.78;
      const distance = viewportHeight * 0.32;
      const progress = Math.min(Math.max((start - rect.top) / distance, 0), 1);
      const tilt = 13 * (1 - progress);
      const lift = 8 * (1 - progress);

      preview.style.setProperty("--preview-tilt", `${tilt}deg`);
      preview.style.setProperty("--preview-lift", `${lift}px`);
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
      {/* Background abstract gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

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
                  className={`col-start-1 row-start-1 w-max justify-self-center whitespace-nowrap rounded-lg bg-cyan-300/10 px-2 transition-[opacity,transform,filter] duration-300 ease-out ${
                    heroWordIndex === index
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

        <div className="mt-20 w-full max-w-6xl px-2 [perspective:1400px] sm:mt-24">
          <div
            ref={previewTiltRef}
            className="origin-top [--preview-lift:8px] [--preview-tilt:13deg] [transform:rotateX(var(--preview-tilt))_translateY(var(--preview-lift))] [transform-style:preserve-3d]"
          >
            <DashboardPreviewImage />
          </div>
        </div>
      </main>
      <FeaturesSection />
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

function FeaturesSection() {
  const features = [
    {
      title: "Portfolio overview",
      description: "See properties, occupancy, rent, and overdue work from one focused dashboard.",
    },
    {
      title: "Tenant operations",
      description: "Keep lease details, contacts, rent status, and payment links organized.",
    },
    {
      title: "Maintenance tracking",
      description: "Log issues, assign priority, and track repair costs through completion.",
    },
  ];

  return (
    <section
      id="features"
      className="relative z-20 w-full px-6 py-20 text-foreground border-t border-dotted border-white/20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your rental workflow needs.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-5"
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

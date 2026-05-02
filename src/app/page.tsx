"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [heroWordState, setHeroWordState] = useState<{
    current: number;
    previous: number | null;
  }>({ current: 0, previous: null });

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
    const intervalId = window.setInterval(() => {
      setHeroWordState(({ current }) => ({
        current: (current + 1) % heroWords.length,
        previous: current,
      }));
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col justify-center items-center relative overflow-hidden dark">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Background abstract gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <header className="absolute inset-x-0 top-0 z-20 px-4 py-5 sm:px-6 lg:px-10">
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

      <div className="z-10 max-w-3xl -translate-y-8 px-4 text-center sm:-translate-y-40">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60"
        >
          Manage properties with{" "}
          <span className="relative inline-block text-left align-baseline">
            {heroWordState.previous !== null && (
              <motion.span
                key={`previous-${heroWordState.previous}-${heroWordState.current}`}
                initial={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                animate={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-0 inline-block rounded-lg bg-cyan-300/10 px-2 text-cyan-200 italic"
                aria-hidden="true"
              >
                {heroWords[heroWordState.previous]}
              </motion.span>
            )}
            <motion.span
              key={`current-${heroWordState.current}`}
              initial={
                heroWordState.previous === null
                  ? false
                  : { opacity: 0, y: 14, filter: "blur(6px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative inline-block rounded-lg bg-cyan-300/10 px-2 text-cyan-200 italic"
            >
              {heroWords[heroWordState.current]}
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light"
        >
          RentFlow provides the most premium, seamless experience for landlords and property managers to oversee their portfolios in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
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
        </motion.div>
      </div>
    </div>
  );
}

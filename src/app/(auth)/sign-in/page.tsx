"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RentFlowLogo from "@/components/brand/RentFlowLogo";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth-callback"
      ? "We could not complete that auth link. Please try signing in again."
      : null
  );

  async function getPostSignInPath(next: string) {
    if (next !== "/dashboard") {
      return next;
    }

    const supabase = createClient();
    const { count, error } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true });

    if (error) {
      return next;
    }

    return count === 0 ? "/onboarding/welcome" : next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const next = searchParams.get("next") || "/dashboard";

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aal.error) {
        setError(aal.error.message);
        toast.error(aal.error.message);
        return;
      }

      const destination = await getPostSignInPath(next);

      toast.success("Welcome back!");
      if (aal.data.nextLevel === "aal2" && aal.data.currentLevel !== aal.data.nextLevel) {
        router.replace(`/verify-mfa?next=${encodeURIComponent(destination)}`);
      } else {
        router.replace(destination);
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="mb-8 text-center">
        <RentFlowLogo className="mx-auto h-16 w-16" />
        <h1 className="mt-6 font-mono text-2xl uppercase tracking-[0.12em] text-white">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-white/50">Sign in to continue managing your portfolio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
          <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
            Your Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="mt-3 h-11 border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/25 focus-visible:ring-0"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
              Password
            </Label>
            <Link href="/forgot-password" className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white">
              Forgot?
            </Link>
          </div>
          <div className="relative mt-3">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="h-11 border-0 bg-transparent px-0 pr-10 text-base text-white shadow-none placeholder:text-white/25 focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="group h-14 w-full rounded-lg border border-cyan-300/70 bg-white/[0.03] font-mono text-sm uppercase tracking-[0.16em] text-cyan-200 hover:bg-cyan-300/10"
          disabled={loading}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-5 w-5 rounded-full border-2 border-cyan-200/25 border-t-cyan-200"
            />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <p className="pt-6 text-center text-sm text-white/45">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-white transition-colors hover:text-cyan-200">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}

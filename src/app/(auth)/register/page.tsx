"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RentFlowLogo from "@/components/brand/RentFlowLogo";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const email = String(formData.get("email") ?? "");
    const company = String(formData.get("company") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company,
            onboarding_completed: false,
          },
        },
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      if (!data.session) {
        const message = "Account created. Check your email to confirm your account before signing in.";
        setSuccess(message);
        toast.success(message);
        return;
      }

      toast.success("Account created!");
      router.replace("/onboarding/welcome");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account.";
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
          Create Account
        </h1>
        <p className="mt-2 text-sm text-white/50">Start your property workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
            <Label htmlFor="first-name" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
              First Name
            </Label>
            <Input
              id="first-name"
              name="firstName"
              placeholder="John"
              required
              autoComplete="given-name"
              className="mt-3 h-11 border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/25 focus-visible:ring-0"
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
            <Label htmlFor="last-name" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
              Last Name
            </Label>
            <Input
              id="last-name"
              name="lastName"
              placeholder="Doe"
              required
              autoComplete="family-name"
              className="mt-3 h-11 border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/25 focus-visible:ring-0"
            />
          </div>
        </div>

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
          <Label htmlFor="company" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
            Company <span className="tracking-normal text-white/30">(Optional)</span>
          </Label>
          <Input
            id="company"
            name="company"
            placeholder="My Property Sdn Bhd"
            autoComplete="organization"
            className="mt-3 h-11 border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/25 focus-visible:ring-0"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
          <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
            Password
          </Label>
          <div className="relative mt-3">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              minLength={8}
              required
              autoComplete="new-password"
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

        <p className="text-xs leading-5 text-white/40">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-white/65 underline decoration-white/20 underline-offset-2 hover:text-white">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="text-white/65 underline decoration-white/20 underline-offset-2 hover:text-white">Privacy Policy</Link>.
        </p>

        {error && (
          <p className="rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-md border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {success}
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
              Create Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <p className="pt-6 text-center text-sm text-white/45">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-white transition-colors hover:text-cyan-200">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RentFlowLogo from "@/components/brand/RentFlowLogo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success("Password reset email sent.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send reset link.";
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
      <div className="mb-7 text-center">
        <RentFlowLogo className="mx-auto h-14 w-14" />
        <h1 className="mt-5 font-mono text-2xl uppercase tracking-[0.12em] text-white">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <div className="mx-auto w-full max-w-[420px]">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                  Your Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="h-12 rounded-md border-white/12 bg-white/[0.055] px-4 text-sm text-white shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-white/35 focus-visible:border-cyan-300/80 focus-visible:bg-white/[0.075] focus-visible:ring-2 focus-visible:ring-cyan-300/20 focus-visible:ring-offset-0"
                />
              </div>

              {error && (
                <p className="rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="group mt-2 h-12 w-full rounded-md border border-cyan-300/70 bg-cyan-300 text-sm font-bold uppercase tracking-[0.14em] text-black shadow-[0_0_24px_rgba(103,232,249,0.16)] transition-all hover:border-cyan-200 hover:bg-cyan-200 focus-visible:ring-cyan-200/40 focus-visible:ring-offset-0"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-cyan-200/25 border-t-cyan-200"
                  />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-2 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300"
              >
                <CheckCircle2 className="h-6 w-6" />
              </motion.div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">Check your email</h3>
                <p className="text-sm leading-6 text-white/55">
                  We&apos;ve sent a password reset link to your email address.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center pt-5">
          <Link
            href="/sign-in"
            className="group flex items-center font-mono text-xs uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-cyan-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

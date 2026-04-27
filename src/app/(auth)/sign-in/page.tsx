"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

      toast.success("Welcome back!");
      router.replace(next);
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
    >
      <Card className="w-full shadow-2xl border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle top glare */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <CardHeader className="pb-2 text-center space-y-3 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-white/60 mt-1">Sign in to your account</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-primary accent-primary"
              />
              <Label htmlFor="remember" className="text-sm font-normal text-white/60 cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {error && (
              <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium transition-all group" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-white/50 pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:text-primary font-medium transition-colors">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

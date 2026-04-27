"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">Reset password</h1>
            <p className="text-sm text-white/60 mt-1">Enter your email and we&apos;ll send you a reset link</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 relative z-10">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
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

                {error && (
                  <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium transition-all" disabled={loading}>
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                    />
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mx-auto w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center border border-green-500/30"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Check your email</h3>
                  <p className="text-sm text-white/60">
                    We&apos;ve sent a password reset link to your email address.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 flex justify-center">
            <Link 
              href="/sign-in" 
              className="group flex items-center text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

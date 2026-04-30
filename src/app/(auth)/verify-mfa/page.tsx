"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Factor = {
  id: string;
  friendly_name?: string;
  factor_type: "totp";
  status: "verified";
};

export default function VerifyMfaPage() {
  return (
    <Suspense>
      <VerifyMfaForm />
    </Suspense>
  );
}

function VerifyMfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [code, setCode] = useState("");
  const [factor, setFactor] = useState<Factor | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFactor, setLoadingFactor] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFactor() {
      try {
        const supabase = createClient();
        const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aal.error) {
          setError(aal.error.message);
          return;
        }

        if (aal.data.currentLevel === "aal2") {
          router.replace(next);
          return;
        }

        const factors = await supabase.auth.mfa.listFactors();

        if (factors.error) {
          setError(factors.error.message);
          return;
        }

        const totpFactor = factors.data.totp.find((item) => item.status === "verified") as Factor | undefined;

        if (!totpFactor) {
          setError("No verified authenticator app was found for this account.");
          return;
        }

        setFactor(totpFactor);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load MFA challenge.";
        setError(message);
      } finally {
        setLoadingFactor(false);
      }
    }

    void loadFactor();
  }, [next, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!factor) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code,
      });

      if (verifyError) {
        setError(verifyError.message);
        toast.error(verifyError.message);
        return;
      }

      toast.success("2-step verification complete.");
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to verify code.";
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
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <CardHeader className="pb-2 text-center space-y-3 relative z-10">
          <div className="flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">2-step verification</h1>
            <p className="text-sm text-white/60 mt-1">Enter your authenticator app code</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="mfa-code" className="text-white/80">Authenticator code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="mfa-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  required
                  disabled={loadingFactor}
                  className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11 pl-9"
                />
              </div>
              {factor?.friendly_name && (
                <p className="text-xs text-white/45">Using {factor.friendly_name}</p>
              )}
            </div>

            {error && (
              <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium transition-all group"
              disabled={loading || loadingFactor || !factor}
            >
              {loading ? "Verifying..." : "Verify"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="text-center text-sm text-white/50 pt-2">
            Wrong account?{" "}
            <Link href="/sign-in" className="text-white hover:text-primary font-medium transition-colors">
              Sign in again
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

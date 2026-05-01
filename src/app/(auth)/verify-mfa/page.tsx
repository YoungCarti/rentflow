"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
      className="w-full"
    >
      <div className="mb-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-mono text-2xl uppercase tracking-[0.12em] text-white">
          2-Step Verification
        </h1>
        <p className="mt-2 text-sm text-white/50">Enter your authenticator app code</p>
      </div>

      <div className="mx-auto w-full max-w-[420px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code" className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
              Authenticator Code
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="mfa-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
                disabled={loadingFactor}
                className="h-12 rounded-md border-white/12 bg-white/[0.055] px-4 pl-11 text-sm tracking-[0.18em] text-white shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-white/35 focus-visible:border-cyan-300/80 focus-visible:bg-white/[0.075] focus-visible:ring-2 focus-visible:ring-cyan-300/20 focus-visible:ring-offset-0"
              />
            </div>
            {factor?.friendly_name && (
              <p className="text-xs text-white/45">Using {factor.friendly_name}</p>
            )}
          </div>

          {error && (
            <p className="rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="group mt-2 h-12 w-full rounded-md border border-cyan-300/70 bg-cyan-300 text-sm font-bold uppercase tracking-[0.14em] text-black shadow-[0_0_24px_rgba(103,232,249,0.16)] transition-all hover:border-cyan-200 hover:bg-cyan-200 focus-visible:ring-cyan-200/40 focus-visible:ring-offset-0"
            disabled={loading || loadingFactor || !factor}
          >
            {loading ? "Verifying..." : "Verify"}
            {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </Button>
        </form>

        <p className="pt-5 text-center text-sm text-white/45">
          Wrong account?{" "}
          <Link href="/sign-in" className="font-medium text-white transition-colors hover:text-cyan-200">
            Sign in again
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 800);
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">Create an account</h1>
            <p className="text-sm text-white/60 mt-1">Start managing your properties today</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-white/80">First name</Label>
                <Input 
                  id="first-name" 
                  placeholder="John" 
                  required 
                  autoComplete="given-name" 
                  className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-white/80">Last name</Label>
                <Input 
                  id="last-name" 
                  placeholder="Doe" 
                  required 
                  autoComplete="family-name" 
                  className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-white/80">Company name <span className="text-white/40 font-normal">(Optional)</span></Label>
              <Input 
                id="company" 
                placeholder="My Property Sdn Bhd" 
                autoComplete="organization" 
                className="bg-black/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary text-white placeholder:text-white/30 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  autoComplete="new-password"
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

            <p className="text-xs text-white/40">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-white/60 hover:text-white transition-colors underline decoration-white/20 underline-offset-2">Terms</Link>
              {" "}and{" "}
              <Link href="#" className="text-white/60 hover:text-white transition-colors underline decoration-white/20 underline-offset-2">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium transition-all group" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-white/50 pt-2">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-white hover:text-primary font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

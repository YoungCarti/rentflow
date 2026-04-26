"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col justify-center items-center relative overflow-hidden dark">
      {/* Background abstract gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 text-center px-4 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center mb-6"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.3)]">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60"
        >
          Manage properties with <span className="text-primary italic">elegance.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light"
        >
          RentFlow provides the most premium, seamless experience for landlords and property managers to oversee their portfolios in real-time.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/sign-in" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <span className="relative z-10">Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
          <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
            Create an Account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

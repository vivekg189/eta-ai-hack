"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="cta" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-blue-500/50" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          className="glass-card rounded-3xl border border-blue-500/25 p-10 sm:p-16 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl" />

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 glass-card-blue px-4 py-2 rounded-full mb-6 border border-blue-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-semibold">Start Your Free Trial Today</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            Turn Industrial Knowledge into{" "}
            <span className="gradient-text">Competitive Advantage</span>
          </motion.h2>

          <motion.p
            className="text-slate-400 text-lg mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            Join 500+ industrial engineers who already use IKT to eliminate downtime,
            preserve expert knowledge, and stay ahead of compliance.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <Button size="xl" className="group gap-2">
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="xl" variant="outline" className="gap-2">
              <Calendar className="w-5 h-5" />
              Request a Demo
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
          >
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> 14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> SOC 2 compliant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Enterprise-grade security
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

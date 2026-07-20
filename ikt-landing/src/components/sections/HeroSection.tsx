"use client";

import { motion } from "framer-motion";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";

const badges = [
  { icon: "🏭", text: "Industrial AI" },
  { icon: "🧠", text: "Knowledge Engineering" },
  { icon: "🔗", text: "Digital Twin" },
  { icon: "⚡", text: "Real-time Insights" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background glows */}
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 glass-card-blue px-4 py-2 rounded-full mb-6 border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-semibold">
                AI-Powered Industrial Intelligence Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Transform Industrial{" "}
              <span className="gradient-text glow-text">Documents</span>{" "}
              into a{" "}
              <span className="gradient-text">Living Knowledge Twin</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={item} className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              An AI-powered operational brain that connects maintenance records, engineering drawings,
              SOPs, inspections, and expert knowledge into one intelligent system.
            </motion.p>

            {/* Badges */}
            <motion.div variants={item} className="flex flex-wrap gap-2 mb-8">
              {badges.map((b) => (
                <span
                  key={b.text}
                  className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-full text-xs text-slate-300 border border-white/10"
                >
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Button size="lg" className="group gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
                Watch Demo
              </Button>
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <a href="/dashboard">
                  View Dashboard →
                </a>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={item} className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["🧑‍🔬", "👨‍🏭", "👩‍💻", "🧑‍💼"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full glass-card border border-white/20 flex items-center justify-center text-sm"
                    style={{ zIndex: 4 - i }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-white font-semibold">500+</span>
                <span className="text-slate-400"> engineers trust IKT</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-amber-400 text-sm">★</span>
                ))}
                <span className="text-slate-400 text-sm ml-1">4.9/5</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Knowledge Graph Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative glass-card rounded-3xl p-6 border border-blue-500/20 glow-blue">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <KnowledgeGraph />
            </div>
            {/* Floating indicator cards */}
            <motion.div
              className="absolute -top-4 -left-4 glass-card rounded-2xl p-3 border border-white/10 shadow-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs text-slate-400">AI Queries</p>
              <p className="text-xl font-bold text-white">Live</p>
              <p className="text-xs text-green-400">Document-driven</p>
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -right-4 glass-card rounded-2xl p-3 border border-white/10 shadow-xl"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs text-slate-400">Entities Extracted</p>
              <p className="text-xl font-bold text-white">From Docs</p>
              <p className="text-xs text-blue-400">Upload to activate</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs text-slate-500">Scroll to explore</span>
        <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1">
          <div className="w-1 h-2 bg-blue-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

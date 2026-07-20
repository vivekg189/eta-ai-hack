"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Cpu, Network, Brain, MessageSquare, ChevronDown } from "lucide-react";

const steps = [
  {
    icon: FileText,
    label: "Documents",
    desc: "PDFs, P&IDs, Emails, SOPs, Logs",
    color: "#3b82f6",
    ring: "border-blue-500/50",
    glow: "shadow-blue-500/30",
  },
  {
    icon: Cpu,
    label: "AI Extraction",
    desc: "NLP, OCR, Vision, Entity Recognition",
    color: "#8b5cf6",
    ring: "border-purple-500/50",
    glow: "shadow-purple-500/30",
  },
  {
    icon: Network,
    label: "Knowledge Graph",
    desc: "Assets, Failures, Procedures, Experts",
    color: "#06b6d4",
    ring: "border-cyan-500/50",
    glow: "shadow-cyan-500/30",
  },
  {
    icon: Brain,
    label: "Knowledge Twin",
    desc: "Living Digital Brain of Your Plant",
    color: "#10b981",
    ring: "border-green-500/50",
    glow: "shadow-green-500/30",
  },
  {
    icon: MessageSquare,
    label: "Industrial Copilot",
    desc: "Q&A, RCA, Compliance, Predictions",
    color: "#f59e0b",
    ring: "border-amber-500/50",
    glow: "shadow-amber-500/30",
  },
];

export function ArchitectureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="architecture" className="section relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-300 text-sm font-semibold mb-4">
            🔌 Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How IKT <span className="gradient-text">Works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A unified AI pipeline that transforms raw industrial data into actionable knowledge intelligence.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col lg:flex-row items-center gap-0 lg:gap-4">
                {/* Step card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                  className={`glass-card glass-card-hover rounded-2xl p-6 border ${step.ring} shadow-lg ${step.glow} w-44 flex-shrink-0 text-center group relative overflow-hidden`}
                >
                  {/* Animated shine */}
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />

                  {/* Step number */}
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: step.color + "33", color: step.color }}
                  >
                    {i + 1}
                  </div>

                  <motion.div
                    className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: step.color + "1a", border: `1px solid ${step.color}40` }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </motion.div>

                  <h3 className="text-white font-bold text-sm mb-1">{step.label}</h3>
                  <p className="text-slate-400 text-xs leading-snug">{step.desc}</p>

                  {/* Pulse dot */}
                  <div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                    style={{ background: step.color }}
                  >
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: step.color, opacity: 0.5 }}
                    />
                  </div>
                </motion.div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <motion.div
                    className="flex lg:flex-row flex-col items-center gap-1 my-2 lg:my-0"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: i * 0.15 + 0.3 }}
                  >
                    {/* Flow line */}
                    <div className="flex flex-col lg:flex-row items-center">
                      <div className="w-px h-6 lg:h-px lg:w-8 bg-gradient-to-b lg:bg-gradient-to-r from-white/30 to-white/10" />
                      <ChevronDown
                        className="w-4 h-4 text-slate-500 lg:rotate-[-90deg] flow-arrow"
                      />
                      <div className="w-px h-2 lg:h-px lg:w-4 bg-white/10" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Processing stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { value: "<2s", label: "Query Response" },
            { value: "99.9%", label: "Extraction Accuracy" },
            { value: "50+", label: "Document Formats" },
            { value: "Real-time", label: "Graph Updates" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-black gradient-text-blue">{stat.value}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

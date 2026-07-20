"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Layers, Dna, Brain, Clock, ShieldCheck } from "lucide-react";

const innovations = [
  {
    icon: Layers,
    title: "Industrial Knowledge Twin",
    headline: "First-of-its-kind",
    description:
      "A living digital replica of your operational knowledge—not just assets, but procedures, expertise, failure histories, and relationships. Self-updating, queryable, and always in sync.",
    tags: ["Graph DB", "Vector Search", "Real-time Sync"],
    color: "#3b82f6",
    gradient: "from-blue-500/15 to-blue-900/10",
    border: "border-blue-500/30",
  },
  {
    icon: Dna,
    title: "Failure Genome Engine",
    headline: "Pattern Intelligence",
    description:
      "Discover the 'DNA' of recurring failures—cross-asset, cross-plant, cross-time. Link seemingly unrelated incidents to identify systemic root causes invisible to human analysis.",
    tags: ["ML Clustering", "Causal AI", "Anomaly Detection"],
    color: "#ef4444",
    gradient: "from-red-500/15 to-red-900/10",
    border: "border-red-500/30",
  },
  {
    icon: Brain,
    title: "Knowledge Loss Predictor",
    headline: "Retention AI",
    description:
      "AI that maps expert knowledge to individuals, predicts retirement risk, quantifies knowledge gaps, and automatically initiates capture workflows before it's too late.",
    tags: ["Risk Scoring", "Auto-Capture", "Gap Analysis"],
    color: "#8b5cf6",
    gradient: "from-purple-500/15 to-purple-900/10",
    border: "border-purple-500/30",
  },
  {
    icon: Clock,
    title: "Incident Time Machine",
    headline: "Temporal Intelligence",
    description:
      "Reconstruct any past incident with full operational context—what was known, what was missed, and what should have been done. AI-powered retrospective analysis.",
    tags: ["Timeline AI", "Context Replay", "RCA Automation"],
    color: "#06b6d4",
    gradient: "from-cyan-500/15 to-cyan-900/10",
    border: "border-cyan-500/30",
  },
  {
    icon: ShieldCheck,
    title: "Autonomous Compliance Auditor",
    headline: "Zero-touch Compliance",
    description:
      "Continuously audit every procedure, maintenance record, and operational decision against ISO, OSHA, API, and custom standards. Auto-generate audit-ready reports.",
    tags: ["ISO 55000", "OSHA", "API RP 580"],
    color: "#10b981",
    gradient: "from-green-500/15 to-green-900/10",
    border: "border-green-500/30",
  },
];

export function UniqueSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="unique" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-purple-500/30 text-purple-300 text-sm font-semibold mb-4">
            💎 Why IKT is Unique
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Innovations That Set Us{" "}
            <span className="gradient-text">Apart</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Five breakthrough technologies working together to solve industrial knowledge challenges
            that no other platform can address.
          </p>
        </motion.div>

        {/* Innovation cards */}
        <div className="space-y-4">
          {innovations.map((inn, i) => {
            const Icon = inn.icon;
            return (
              <motion.div
                key={inn.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`glass-card glass-card-hover rounded-2xl border ${inn.border} overflow-hidden group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${inn.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10 p-6 flex flex-col lg:flex-row items-start gap-6">
                  {/* Icon + number */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: inn.color + "1a", border: `1px solid ${inn.color}40` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: inn.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-xl">{inn.title}</h3>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: inn.color + "22", color: inn.color }}
                      >
                        {inn.headline}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-3 max-w-2xl">
                      {inn.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inn.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full glass-card border border-white/10 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: inn.color }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

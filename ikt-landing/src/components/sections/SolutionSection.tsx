"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  FileText,
  Network,
  Bot,
  Dna,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Universal Document Intelligence",
    description:
      "Ingest any format—P&IDs, SOPs, maintenance logs, inspection reports, emails—and extract structured knowledge automatically.",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    tag: "Core AI",
  },
  {
    icon: Network,
    title: "Knowledge Graph Engine",
    description:
      "Connect assets, failure modes, procedures, and experts into a dynamic, queryable graph that reveals hidden relationships.",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    tag: "Graph AI",
  },
  {
    icon: Bot,
    title: "AI Industrial Copilot",
    description:
      "Ask complex operational questions in plain language. Get answers with full source citations from your knowledge base.",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
    tag: "LLM-Powered",
  },
  {
    icon: Dna,
    title: "Failure Genome Detection",
    description:
      "Identify recurring failure DNA across assets and plants. Predict failures before they happen using historical incident patterns.",
    color: "text-red-400",
    gradient: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    tag: "Predictive",
  },
  {
    icon: BrainCircuit,
    title: "Knowledge Loss Prediction",
    description:
      "Identify critical knowledge at risk from retirements. Automatically capture and preserve expert tribal knowledge.",
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    tag: "Risk AI",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Intelligence",
    description:
      "Autonomously audit operations against regulations, standards, and best practices. Generate compliance reports instantly.",
    color: "text-green-400",
    gradient: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
    glow: "shadow-green-500/20",
    tag: "Compliance",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function SolutionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="solution" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-blue border border-blue-500/30 text-blue-300 text-sm font-semibold mb-4">
            🧠 The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet the{" "}
            <span className="gradient-text">Industrial Knowledge Twin</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive AI platform that transforms how industrial organizations
            capture, connect, and leverage operational knowledge.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            const isHovered = hovered === i;
            return (
              <motion.div
                key={f.title}
                variants={item}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`glass-card rounded-2xl p-6 border ${f.border} relative overflow-hidden cursor-pointer transition-all duration-300 ${
                  isHovered ? `shadow-2xl ${f.glow} -translate-y-2` : ""
                }`}
              >
                {/* Hover gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient}`}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="relative z-10">
                  {/* Tag */}
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full glass-card border ${f.border} ${f.color} mb-3`}>
                    {f.tag}
                  </span>

                  {/* Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-xl glass-card flex items-center justify-center mb-4 border ${f.border}`}
                    animate={{ rotate: isHovered ? 10 : 0, scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </motion.div>

                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>

                  {/* Hover arrow */}
                  <motion.div
                    className={`mt-4 flex items-center gap-1 text-sm font-semibold ${f.color}`}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn more →
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

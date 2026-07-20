"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, AlertTriangle, UserX, GitFork } from "lucide-react";

const problems = [
  {
    icon: Clock,
    stat: "35%",
    label: "Time Lost Searching",
    description:
      "Engineers spend over a third of their day hunting through disconnected systems, emails, and paper records for critical operational information.",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    statColor: "text-red-400",
  },
  {
    icon: AlertTriangle,
    stat: "22%",
    label: "Downtime from Fragmentation",
    description:
      "Knowledge silos between departments lead to repeated failures, missed maintenance windows, and costly unplanned shutdowns.",
    color: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    statColor: "text-amber-400",
  },
  {
    icon: UserX,
    stat: "40%",
    label: "Critical Knowledge at Risk",
    description:
      "Retiring experts carry decades of tribal knowledge out the door—failure modes, workarounds, and undocumented procedures lost forever.",
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    statColor: "text-purple-400",
  },
  {
    icon: GitFork,
    stat: "12+",
    label: "Disconnected Systems",
    description:
      "CMMS, ERP, DCS, drawings, emails, and spreadsheets—each in isolation, creating dangerous blind spots in operational intelligence.",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    statColor: "text-blue-400",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function AnimatedStat({ value, color }: { value: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      className={`text-4xl font-black ${color}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
    >
      {value}
    </motion.span>
  );
}

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="section relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-red-500/30 text-red-400 text-sm font-semibold mb-4">
            ⚠️ The Industrial Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Hidden Cost of{" "}
            <span className="gradient-text">Knowledge Fragmentation</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Industrial operations bleed efficiency, safety, and profitability through preventable
            knowledge failures every single day.
          </p>
        </motion.div>

        {/* Problem cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                variants={item}
                className={`glass-card glass-card-hover rounded-2xl p-6 border ${p.border} relative overflow-hidden group`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl glass-card flex items-center justify-center mb-4 border ${p.border}`}>
                    <Icon className={`w-6 h-6 ${p.iconColor}`} />
                  </div>
                  <AnimatedStat value={p.stat} color={p.statColor} />
                  <h3 className="text-white font-bold mt-1 mb-2">{p.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom impact statement */}
        <motion.div
          className="mt-16 glass-card border border-white/10 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-2xl font-bold text-white mb-2">
            Together, these failures cost the average industrial facility
          </p>
          <p className="text-5xl font-black gradient-text-blue">$2.4M+ annually</p>
          <p className="text-slate-400 mt-2">in preventable downtime, rework, and knowledge loss</p>
        </motion.div>
      </div>
    </section>
  );
}

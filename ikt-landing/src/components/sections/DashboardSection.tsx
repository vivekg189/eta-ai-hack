"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, AlertCircle, ShieldCheck, Brain, FileSearch } from "lucide-react";

// Illustrative pipeline flow labels only — no hardcoded asset names or scores
const kpis = [
  { icon: Activity, label: "Asset Health", value: "—", trend: "From documents", color: "text-green-400", border: "border-green-500/30" },
  { icon: AlertCircle, label: "Active Risks", value: "—", trend: "From knowledge graph", color: "text-amber-400", border: "border-amber-500/30" },
  { icon: ShieldCheck, label: "Compliance Score", value: "—", trend: "From extracted standards", color: "text-blue-400", border: "border-blue-500/30" },
  { icon: Brain, label: "Knowledge Risk", value: "—", trend: "From entity analysis", color: "text-purple-400", border: "border-purple-500/30" },
  { icon: FileSearch, label: "Docs Indexed", value: "—", trend: "Upload to activate", color: "text-cyan-400", border: "border-cyan-500/30" },
];

export function DashboardSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="dashboard" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-green-500/30 text-green-300 text-sm font-semibold mb-4">
            📊 Dashboard Preview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Knowledge Twin{" "}
            <span className="gradient-text">Command Center</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A real-time operational intelligence hub—monitor asset health, knowledge risks,
            compliance, and get AI-driven insights all in one place.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-card rounded-3xl border border-blue-500/20 overflow-hidden shadow-2xl shadow-blue-500/10"
        >
          {/* Dashboard header bar */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-4 h-6 glass-card rounded-full flex items-center px-3">
              <span className="text-slate-500 text-xs">🔒 app.ikt.ai/dashboard/plant-001</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>

          <div className="p-6">
            {/* KPI cards row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={kpi.label}
                    className={`glass-card rounded-xl p-3 border ${kpi.border}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                      <span className="text-slate-400 text-xs">{kpi.label}</span>
                    </div>
                    <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{kpi.trend}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Main content area */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Pipeline flow diagram */}
              <div className="lg:col-span-2 glass-card rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold text-sm">Document Intelligence Pipeline</h4>
                  <span className="text-blue-400 text-xs font-bold">Upload → Extract → Analyze</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-4">
                  {["Upload Docs", "OCR Extract", "Entity NER", "Graph Link", "AI Insights"].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 text-[10px] font-bold">{i + 1}</div>
                        <span className="text-[9px] text-slate-400 text-center leading-tight max-w-[52px]">{step}</span>
                      </div>
                      {i < 4 && <div className="w-4 h-px bg-blue-500/30 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-[10px] mt-4 text-center">Intelligence is generated exclusively from your uploaded documents</p>
              </div>

              {/* Entity types discovered */}
              <div className="glass-card rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-semibold text-sm mb-3">Entity Types Extracted</h4>
                <div className="space-y-2">
                  {["Assets & Equipment", "Compliance Standards", "Failure Patterns", "Procedures & SOPs"].map((type) => (
                    <div key={type} className="flex items-center justify-between p-2 glass-card rounded-lg border border-white/5">
                      <p className="text-slate-300 text-xs font-semibold">{type}</p>
                      <span className="text-[9px] text-blue-400 font-bold">From docs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Copilot chat preview */}
            <div className="mt-4 glass-card rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px]">🤖</span>
                </div>
                <span className="text-blue-300 text-sm font-semibold">AI Industrial Copilot</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="glass-card rounded-xl rounded-tl-none p-2.5 text-xs text-slate-300 max-w-sm border border-white/10">
                    What compliance standards are referenced in my uploaded documents?
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl rounded-tr-none p-2.5 text-xs text-slate-200 max-w-sm">
                    I can only answer based on your uploaded documents. Upload compliance manuals, inspection reports, or SOPs and I will extract all referenced standards, regulations, and audit requirements.{" "}
                    <span className="text-blue-400">Upload documents to begin →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, CheckCircle2, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlaceholderModuleProps {
  title: string;
  subtitle?: string;
  description: string;
  statusBadge?: string;
  icon: LucideIcon;
  capabilities: Array<{
    title: string;
    description: string;
  }>;
  expectedAI: Array<{
    feature: string;
    impact: string;
  }>;
}

export function PlaceholderModule({
  title,
  subtitle = "This module is currently under development.",
  description,
  statusBadge = "Coming Soon",
  icon: Icon,
  capabilities,
  expectedAI,
}: PlaceholderModuleProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* ── Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 p-8 sm:p-10 text-white shadow-xl"
      >
        {/* Animated background highlights */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-blue-500 blur-3xl animate-pulse" />
          <div className="absolute -bottom-16 left-24 w-48 h-48 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            {/* Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              {statusBadge}
            </span>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <Icon className="w-7 h-7" />
                </div>
                {title}
              </h1>
              <p className="text-blue-200 text-sm font-semibold tracking-wide uppercase">
                {subtitle}
              </p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Development Signifier */}
          <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-[220px] backdrop-blur-sm">
            <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" style={{ animationDuration: '6s' }} />
            <p className="text-xs font-bold text-white uppercase tracking-wider">AI Integration Queue</p>
            <p className="text-[10px] text-slate-400 mt-1">Ingesting data from Document Center to train active parameters</p>
          </div>
        </div>
      </motion.div>

      {/* ── Key Capabilities Section ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Module Core Capabilities</h2>
          <p className="text-xs text-slate-400">Functional goals designated for the pipeline index release</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800">{cap.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{cap.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Expected AI Functionality Section ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Advanced AI Reasoning Pipeline
          </h2>
          <p className="text-xs text-slate-400">Expected neural architectures that will analyze ingested document embeddings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expectedAI.map((ai, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group cursor-default"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {ai.feature}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold max-w-xl">
                  {ai.impact}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-all shadow-inner">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}

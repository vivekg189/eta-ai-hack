"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp } from "lucide-react";
import type { Recommendation } from "@/lib/document-intelligence";

const priorityConfig = {
  high: {
    border: "border-red-200",
    bg: "bg-gradient-to-br from-red-50 to-orange-50",
    badge: "bg-red-100 text-red-700 border-red-200",
    accent: "bg-red-500",
    action: "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100",
    label: "High Priority",
    conf: "text-red-600",
  },
  medium: {
    border: "border-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    accent: "bg-amber-500",
    action: "text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100",
    label: "Medium Priority",
    conf: "text-amber-600",
  },
  low: {
    border: "border-green-200",
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    badge: "bg-green-100 text-green-700 border-green-200",
    accent: "bg-green-500",
    action: "text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100",
    label: "Low Priority",
    conf: "text-green-600",
  },
};

interface InsightCardProps {
  insight: Recommendation;
  index: number;
}

export function InsightCard({ insight, index }: InsightCardProps) {
  const cfg = priorityConfig[insight.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`relative rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-default ${cfg.border} ${cfg.bg}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${cfg.accent}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            AI Insight #{index + 1}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Asset + confidence */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
          {insight.asset}
        </span>
        <span className={`text-[10px] font-bold ${cfg.conf}`}>
          {insight.confidence}% confidence
        </span>
        <span className="text-[10px] text-slate-400">· {insight.source_docs} sources</span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-slate-800 mb-2 leading-snug">{insight.title}</h4>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed mb-3">{insight.description}</p>

      {/* Impact badge */}
      {insight.estimated_impact && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white/60 rounded-lg px-2.5 py-1.5 mb-3">
          <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span>{insight.estimated_impact}</span>
        </div>
      )}

      {/* Action */}
      <div className="pt-3 border-t border-white/80">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
          Suggested Action
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700 flex-1">{insight.action}</p>
          <motion.button
            whileHover={{ x: 3 }}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ml-2 ${cfg.action}`}
          >
            Act <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

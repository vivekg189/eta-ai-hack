"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, AlertOctagon, Target } from "lucide-react";
import type { FailurePattern } from "@/lib/document-intelligence";

const riskConfig = {
  Critical: {
    badge: "bg-red-500 text-white",
    bg: "bg-gradient-to-br from-red-50 to-orange-50",
    border: "border-red-200",
    glow: "hover:shadow-red-100",
    accent: "#ef4444",
    icon: AlertOctagon,
    iconClass: "text-red-500",
  },
  High: {
    badge: "bg-orange-500 text-white",
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    border: "border-orange-200",
    glow: "hover:shadow-orange-100",
    accent: "#f97316",
    icon: Target,
    iconClass: "text-orange-500",
  },
  Medium: {
    badge: "bg-amber-400 text-white",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    border: "border-amber-200",
    glow: "hover:shadow-amber-100",
    accent: "#f59e0b",
    icon: Target,
    iconClass: "text-amber-500",
  },
  Low: {
    badge: "bg-green-500 text-white",
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    border: "border-green-200",
    glow: "hover:shadow-green-100",
    accent: "#22c55e",
    icon: Target,
    iconClass: "text-green-500",
  },
};

const DEFAULT_RISK_CFG = riskConfig.Low;

const trendConfig = {
  rising:  { icon: TrendingUp,   label: "Rising",  color: "text-red-500" },
  stable:  { icon: Minus,        label: "Stable",  color: "text-slate-400" },
  falling: { icon: TrendingDown, label: "Falling", color: "text-green-500" },
};

const DEFAULT_TREND = trendConfig.stable;

interface FailureGenomeCardProps {
  pattern: FailurePattern;
  index: number;
}

export function FailureGenomeCard({ pattern, index }: FailureGenomeCardProps) {
  // API uses snake_case: affected_assets, discovered_at
  const riskLevel = pattern.risk as keyof typeof riskConfig;
  const trendKey = pattern.trend as keyof typeof trendConfig;
  const cfg = riskConfig[riskLevel] ?? DEFAULT_RISK_CFG;
  const trend = trendConfig[trendKey] ?? DEFAULT_TREND;
  const TrendIcon = trend.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${cfg.bg} ${cfg.border} ${cfg.glow} cursor-default`}
    >
      {/* Decorative corner */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10"
        style={{ backgroundColor: cfg.accent }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Zap className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">{pattern.pattern}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {riskLevel}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Discovered {pattern.discovered_at}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend.color}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trend.label}</span>
        </div>
      </div>

      {/* Cause */}
      <p className="text-sm font-semibold text-slate-700 mb-4">
        Cause: <span className="font-bold text-slate-800">{pattern.cause}</span>
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
          <p className="text-2xl font-black text-slate-800">{pattern.occurrences}</p>
          <p className="text-[10px] text-slate-500 font-medium">Occurrences</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
          {/* API field: affected_assets */}
          <p className="text-2xl font-black text-slate-800">
            {Array.isArray(pattern.affected_assets) ? pattern.affected_assets.length : pattern.affected_assets}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Assets Affected</p>
        </div>
      </div>

      {/* DNA visual bars */}
      <div className="flex items-end gap-0.5 h-6 mt-4 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{ backgroundColor: cfg.accent }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 100}%` }}
            transition={{ delay: 0.5 + i * 0.03, duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

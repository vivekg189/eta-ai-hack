"use client";

import { motion } from "framer-motion";
import { Flame, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import type { KnowledgeRisk } from "@/lib/document-intelligence";

const levelConfig = {
  Critical: {
    bg: "bg-red-50", border: "border-red-200",
    badge: "bg-red-500 text-white", bar: "bg-red-500",
    icon: Flame, text: "text-red-700", glow: "hover:shadow-red-100",
  },
  High: {
    bg: "bg-orange-50", border: "border-orange-200",
    badge: "bg-orange-500 text-white", bar: "bg-orange-500",
    icon: AlertTriangle, text: "text-orange-700", glow: "hover:shadow-orange-100",
  },
  Medium: {
    bg: "bg-yellow-50", border: "border-yellow-200",
    badge: "bg-yellow-500 text-white", bar: "bg-yellow-500",
    icon: AlertCircle, text: "text-yellow-700", glow: "hover:shadow-yellow-100",
  },
  Low: {
    bg: "bg-green-50", border: "border-green-200",
    badge: "bg-green-500 text-white", bar: "bg-green-500",
    icon: CheckCircle, text: "text-green-700", glow: "hover:shadow-green-100",
  },
};

interface KnowledgeRiskHeatmapProps {
  risks: KnowledgeRisk[];
}

export function KnowledgeRiskHeatmap({ risks }: KnowledgeRiskHeatmapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Knowledge Risk Heatmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">Risk exposure from knowledge concentration</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {risks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-3xl mb-2">🔐</div>
          <p className="text-sm font-semibold text-slate-600">No risk data yet</p>
          <p className="text-xs text-slate-400 mt-1">Upload documents to generate knowledge risk scores</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {(["Critical", "High", "Medium", "Low"] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${levelConfig[level].bar}`} />
                <span className="text-xs text-slate-500 font-medium">{level}</span>
              </div>
            ))}
          </div>

          {/* Risk items */}
          <div className="space-y-2.5">
            {risks.map((item, index) => {
              const cfg = levelConfig[item.level];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-default transition-shadow hover:shadow-md ${cfg.bg} ${cfg.border} ${cfg.glow}`}
                >
                  <div className="p-1.5 rounded-lg bg-white shadow-sm flex-shrink-0">
                    <Icon className={`w-4 h-4 ${cfg.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.asset}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${cfg.badge}`}>
                        {item.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1.5">{item.reason}</p>
                    <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.08, ease: "easeOut" }}
                        className={`h-full rounded-full ${cfg.bar}`}
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span className={`text-sm font-black ${cfg.text}`}>{item.score}</span>
                    <span className="text-xs text-slate-400 block">risk</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

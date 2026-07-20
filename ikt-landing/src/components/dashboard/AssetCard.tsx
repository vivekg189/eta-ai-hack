"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Activity, Clock, ChevronRight } from "lucide-react";
import type { AssetData } from "@/lib/document-intelligence";

const riskConfig = {
  Critical: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", ring: "ring-red-200" },
  High:     { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", ring: "ring-orange-200" },
  Medium:   { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400", ring: "ring-amber-200" },
  Low:      { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", ring: "ring-green-200" },
};

const DEFAULT_RISK = riskConfig.Low;

function healthColor(score: number) {
  if (score >= 85) return "#22c55e";
  if (score >= 65) return "#f59e0b";
  return "#ef4444";
}

function HealthBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

interface AssetCardProps {
  asset: AssetData;
  index: number;
}

export function AssetCard({ asset, index }: AssetCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // API returns snake_case knowledge_risk
  const riskLevel = asset.knowledge_risk as keyof typeof riskConfig;
  const risk = riskConfig[riskLevel] ?? DEFAULT_RISK;

  const health = asset.health_score ?? 0;
  const compliance = asset.compliance_score ?? 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{asset.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{asset.type}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ring-1 ${risk.bg} ${risk.text} ${risk.ring}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
          {riskLevel ?? "Unknown"}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Health Score
            </span>
            <span className="text-xs font-bold" style={{ color: healthColor(health) }}>
              {health}%
            </span>
          </div>
          <HealthBar value={health} color={healthColor(health)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Compliance</span>
            <span className="text-xs font-bold text-blue-600">{compliance}%</span>
          </div>
          <HealthBar value={compliance} color="#3b82f6" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-500">
          <FileText className="w-3.5 h-3.5" />
          <span className="text-xs">{asset.documents ?? 0} docs</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          {asset.last_updated ?? "—"}
        </div>
      </div>
    </motion.div>
  );
}

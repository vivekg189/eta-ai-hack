"use client";

import { motion } from "framer-motion";
import type { ComplianceData } from "@/lib/document-intelligence";

const statusConfig = {
  healthy: {
    badge: "bg-green-100 text-green-700 border-green-200",
    bar: "from-green-500 to-emerald-400",
    border: "border-green-200",
    bg: "bg-green-50/50",
    dot: "bg-green-500",
  },
  warning: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "from-amber-500 to-yellow-400",
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    dot: "bg-amber-500",
  },
  critical: {
    badge: "bg-red-100 text-red-700 border-red-200",
    bar: "from-red-500 to-orange-400",
    border: "border-red-200",
    bg: "bg-red-50/50",
    dot: "bg-red-500",
  },
};

const DEFAULT_STATUS = statusConfig.healthy;

interface ComplianceCardProps {
  item: ComplianceData;
  index: number;
}

export function ComplianceCard({ item, index }: ComplianceCardProps) {
  // API field: status is "healthy" | "warning" | "critical"
  const statusKey = item.status as keyof typeof statusConfig;
  const cfg = statusConfig[statusKey] ?? DEFAULT_STATUS;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ x: 4 }}
      className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg} cursor-default transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className="text-sm font-bold text-slate-800">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-800">{item.score}%</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${cfg.badge}`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 0.9, delay: 0.2 + index * 0.08, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        {/* API field: last_audit (snake_case) */}
        <p className="text-[10px] text-slate-400">Last audit: {item.last_audit}</p>
        {item.gaps !== undefined && (
          <p className="text-[10px] text-slate-400">{item.gaps} gap{item.gaps !== 1 ? "s" : ""}</p>
        )}
      </div>
    </motion.div>
  );
}

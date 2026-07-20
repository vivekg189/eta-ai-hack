"use client";

import { motion } from "framer-motion";
import { Upload, AlertTriangle, ShieldAlert, Lightbulb, Wrench, Brain } from "lucide-react";
import type { ActivityEvent } from "@/lib/document-intelligence";

const typeConfig = {
  upload: { icon: Upload, bg: "bg-blue-100", iconClass: "text-blue-600", border: "border-blue-200" },
  alert: { icon: AlertTriangle, bg: "bg-red-100", iconClass: "text-red-600", border: "border-red-200" },
  compliance: { icon: ShieldAlert, bg: "bg-amber-100", iconClass: "text-amber-600", border: "border-amber-200" },
  discovery: { icon: Lightbulb, bg: "bg-purple-100", iconClass: "text-purple-600", border: "border-purple-200" },
  maintenance: { icon: Wrench, bg: "bg-green-100", iconClass: "text-green-600", border: "border-green-200" },
};

const severityDot: Record<string, string> = {
  info: "bg-blue-400",
  warning: "bg-amber-400",
  critical: "bg-red-500",
  success: "bg-green-500",
};

interface ActivityFeedProps {
  feed: ActivityEvent[];
}

export function ActivityFeed({ feed }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Live Operational Intelligence</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time activity across your knowledge twin</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-600">Live</span>
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="text-3xl mb-2">📡</div>
          <p className="text-sm font-semibold text-slate-600">No activity yet</p>
          <p className="text-xs text-slate-400 mt-1">Events will appear here as documents are processed</p>
        </div>
      ) : (
        <div className="space-y-1">
          {feed.map((item, index) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            const dot = severityDot[item.severity] || "bg-slate-400";
            const isLast = index === feed.length - 1;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + index * 0.07 }}
                className="relative flex gap-3 pb-4 group"
              >
                {!isLast && (
                  <div className="absolute left-[18px] top-8 bottom-0 w-px bg-slate-100" />
                )}
                <div className={`relative flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${cfg.bg} ${cfg.border}`}>
                  <Icon className={`w-4 h-4 ${cfg.iconClass}`} />
                  <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${dot}`} />
                </div>
                <div className="flex-1 pt-1.5 min-w-0">
                  <p className="text-sm text-slate-700 font-medium leading-snug">{item.message}</p>
                  {item.detail && (
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">{item.detail}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.asset && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                        {item.asset}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{item.relative_time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="pt-3 border-t border-slate-100">
        <button className="w-full text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors text-center py-1">
          View all activity →
        </button>
      </div>
    </motion.div>
  );
}

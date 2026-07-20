"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Factory, Brain, Shield, AlertTriangle } from "lucide-react";
import type { KpiCard } from "@/lib/dashboard-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Factory, Brain, Shield, AlertTriangle,
};

const statusColors = {
  green: {
    badge: "bg-green-100 text-green-700 border-green-200",
    glow: "shadow-green-100",
    ring: "ring-green-200",
  },
  red: {
    badge: "bg-red-100 text-red-700 border-red-200",
    glow: "shadow-red-100",
    ring: "ring-red-200",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    glow: "shadow-blue-100",
    ring: "ring-blue-200",
  },
  orange: {
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    glow: "shadow-orange-100",
    ring: "ring-orange-200",
  },
};

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

interface KpiCardProps {
  card: KpiCard;
  index: number;
}

export function KpiCardComponent({ card, index }: KpiCardProps) {
  const Icon = iconMap[card.icon];
  const colors = statusColors[card.statusColor];
  const count = useCountUp(card.numericValue, 1200 + index * 200);

  const displayValue = card.value.includes("%")
    ? `${count}%`
    : card.value.includes(",")
    ? count.toLocaleString()
    : `${count}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${colors.glow}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60`} />

      {/* Animated corner accent */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-white/40 to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-white border shadow-sm ${colors.ring} ring-1`}>
            {Icon && <Icon className="w-5 h-5 text-slate-600" />}
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${colors.badge}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {card.status}
          </div>
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tight">
            {displayValue}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm text-slate-500 font-medium mb-3">{card.title}</p>

        {/* Change Indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            card.changeType === "positive"
              ? "text-green-600"
              : card.changeType === "negative"
              ? "text-red-500"
              : "text-slate-500"
          }`}>
            {card.changeType === "positive" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : card.changeType === "negative" ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {card.change}
          </div>
          <span className="text-xs text-slate-400">vs last week</span>
        </div>
      </div>
    </motion.div>
  );
}

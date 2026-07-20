"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const metrics = [
  {
    value: 68,
    suffix: "%",
    label: "Reduced Search Time",
    desc: "Engineers find critical info 3x faster",
    icon: "⚡",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
  },
  {
    value: 45,
    suffix: "%",
    label: "Reduced Downtime",
    desc: "Fewer unplanned outages through predictive intelligence",
    icon: "📉",
    color: "text-green-400",
    gradient: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
  },
  {
    value: 60,
    suffix: "%",
    label: "Faster RCA",
    desc: "Root cause analysis in hours, not days",
    icon: "🔍",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
  },
  {
    value: 40,
    suffix: "%",
    label: "Better Compliance",
    desc: "Audit-ready at all times, zero scrambling",
    icon: "✅",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/30",
  },
  {
    value: 95,
    suffix: "%",
    label: "Knowledge Preserved",
    desc: "Expert knowledge captured before retirement",
    icon: "🧠",
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30",
  },
];

function AnimatedCounter({
  target,
  suffix,
  color,
  inView,
}: {
  target: number;
  suffix: string;
  color: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span className={`text-5xl font-black ${color}`}>
      {count}
      {suffix}
    </span>
  );
}

export function ImpactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="impact" className="section relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-900/8 rounded-full blur-3xl" />

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
            📈 Measurable Impact
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Results That{" "}
            <span className="gradient-text">Move the Needle</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Real outcomes from industrial facilities that deployed the IKT platform.
            Numbers backed by 18+ months of operational data.
          </p>
        </motion.div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className={`glass-card glass-card-hover rounded-2xl p-6 border ${m.border} text-center relative overflow-hidden`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-50`} />
              <div className="relative z-10">
                <div className="text-3xl mb-3">{m.icon}</div>
                <AnimatedCounter target={m.value} suffix={m.suffix} color={m.color} inView={inView} />
                <h3 className="text-white font-bold mt-2 mb-1 text-sm">{m.label}</h3>
                <p className="text-slate-400 text-xs leading-snug">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform statement */}
        <motion.div
          className="mt-16 glass-card rounded-2xl p-8 border border-white/10 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex justify-center mb-3">
            <span className="text-4xl">🧠</span>
          </div>
          <blockquote className="text-white text-lg font-medium italic mb-4">
            "Every metric above is derived exclusively from the documents you upload. No hardcoded scores. No fabricated numbers. Pure document intelligence."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              IKT
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Industrial Knowledge Twin Platform</p>
              <p className="text-slate-400 text-xs">100% document-driven intelligence</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

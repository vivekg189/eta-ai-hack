"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  ring: string;
  size: number;
  icon: string;
}

interface Edge {
  from: string;
  to: string;
}

const nodes: Node[] = [
  { id: "ikt", label: "IKT Core", x: 50, y: 50, color: "#3b82f6", ring: "#60a5fa", size: 36, icon: "🧠" },
  { id: "pump", label: "Pump-A12", x: 20, y: 20, color: "#0ea5e9", ring: "#38bdf8", size: 26, icon: "⚙️" },
  { id: "boiler", label: "Boiler-B3", x: 80, y: 20, color: "#8b5cf6", ring: "#a78bfa", size: 26, icon: "🔥" },
  { id: "comp", label: "Compressor", x: 80, y: 78, color: "#10b981", ring: "#34d399", size: 26, icon: "🌀" },
  { id: "valve", label: "Valve-V9", x: 20, y: 78, color: "#f59e0b", ring: "#fbbf24", size: 22, icon: "🔩" },
  { id: "sop", label: "SOPs", x: 50, y: 15, color: "#06b6d4", ring: "#22d3ee", size: 20, icon: "📋" },
  { id: "maint", label: "Maintenance", x: 85, y: 50, color: "#ec4899", ring: "#f472b6", size: 20, icon: "🔧" },
  { id: "ai", label: "AI Engine", x: 15, y: 50, color: "#6366f1", ring: "#818cf8", size: 22, icon: "✨" },
];

const edges: Edge[] = [
  { from: "ikt", to: "pump" },
  { from: "ikt", to: "boiler" },
  { from: "ikt", to: "comp" },
  { from: "ikt", to: "valve" },
  { from: "ikt", to: "sop" },
  { from: "ikt", to: "maint" },
  { from: "ikt", to: "ai" },
  { from: "pump", to: "maint" },
  { from: "boiler", to: "sop" },
  { from: "ai", to: "pump" },
];

export function KnowledgeGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimPhase((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getPos = (node: Node, containerW: number, containerH: number) => ({
    x: (node.x / 100) * containerW,
    y: (node.y / 100) * containerH,
  });

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 30px rgba(59,130,246,0.3))" }}
      >
        {/* Gradient defs */}
        <defs>
          <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0a0f1e" stopOpacity="0" />
          </radialGradient>
          {nodes.map((n) => (
            <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.5" />
            </radialGradient>
          ))}
        </defs>

        <circle cx="250" cy="250" r="250" fill="url(#bg-grad)" />

        {/* Animated grid circles */}
        {[80, 150, 220].map((r) => (
          <circle key={r} cx="250" cy="250" r={r} fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="1" />
        ))}

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find((n) => n.id === edge.from)!;
          const to = nodes.find((n) => n.id === edge.to)!;
          const x1 = (from.x / 100) * 500;
          const y1 = (from.y / 100) * 500;
          const x2 = (to.x / 100) * 500;
          const y2 = (to.y / 100) * 500;
          const isHovered = hoveredNode === edge.from || hoveredNode === edge.to;
          return (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isHovered ? "rgba(59,130,246,0.7)" : "rgba(59,130,246,0.15)"}
                strokeWidth={isHovered ? 1.5 : 0.8}
                strokeDasharray={isHovered ? "none" : "4 4"}
                style={{ transition: "all 0.3s ease" }}
              />
              {/* Animated pulse dot on edge */}
              <circle r="3" fill="#60a5fa" opacity="0.8">
                <animateMotion
                  dur={`${2 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M${x1},${y1} L${x2},${y2}`}
                />
                <animate attributeName="opacity" values="0;0.8;0" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const x = (node.x / 100) * 500;
          const y = (node.y / 100) * 500;
          const isHovered = hoveredNode === node.id;
          const isCore = node.id === "ikt";
          return (
            <g
              key={node.id}
              transform={`translate(${x}, ${y})`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Pulsing ring */}
              <circle
                r={node.size + 8}
                fill="none"
                stroke={node.ring}
                strokeWidth="1"
                opacity={isHovered ? 0.6 : 0.2}
                style={{ transition: "all 0.3s ease" }}
              >
                {isCore && (
                  <animate
                    attributeName="r"
                    values={`${node.size + 6};${node.size + 18};${node.size + 6}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              {/* Node circle */}
              <circle
                r={isHovered ? node.size + 4 : node.size}
                fill={`url(#grad-${node.id})`}
                stroke={node.ring}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: "all 0.3s ease", filter: isHovered ? `drop-shadow(0 0 12px ${node.color})` : "none" }}
              />
              {/* Icon / label */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.size * 0.85}
                style={{ userSelect: "none" }}
              >
                {node.icon}
              </text>
              <text
                y={node.size + 14}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(148,163,184,0.9)"
                fontWeight="600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating cards */}
      <motion.div
        className="absolute top-2 right-0 glass-card px-3 py-2 text-xs rounded-xl border border-green-500/30"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-green-400 font-bold">Asset Health</div>
        <div className="text-white text-sm font-bold">92.4%</div>
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-0 glass-card px-3 py-2 text-xs rounded-xl border border-amber-500/30"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-amber-400 font-bold">Knowledge Risk</div>
        <div className="text-white text-sm font-bold">Low 🟢</div>
      </motion.div>
      <motion.div
        className="absolute bottom-8 right-2 glass-card px-3 py-2 text-xs rounded-xl border border-blue-500/30"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-blue-400 font-bold">Compliance</div>
        <div className="text-white text-sm font-bold">✅ 98%</div>
      </motion.div>
    </div>
  );
}

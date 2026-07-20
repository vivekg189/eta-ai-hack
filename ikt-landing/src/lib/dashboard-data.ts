// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface KpiCard {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  status: string;
  statusColor: "green" | "red" | "blue" | "orange";
  icon: string;
  gradient: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  healthScore: number;
  knowledgeRisk: "Critical" | "High" | "Medium" | "Low";
  complianceScore: number;
  documents: number;
  lastUpdated: string;
}

export interface FailurePattern {
  id: string;
  pattern: string;
  cause: string;
  occurrences: number;
  affectedAssets: number;
  risk: "Critical" | "High" | "Medium" | "Low";
  trend: "rising" | "stable" | "falling";
  discoveredAt: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: "upload" | "alert" | "compliance" | "discovery" | "maintenance";
  severity: "info" | "warning" | "critical" | "success";
  asset?: string;
}

export interface ComplianceItem {
  id: string;
  name: string;
  score: number;
  status: "healthy" | "warning" | "critical";
  lastAudit: string;
}

export interface RiskItem {
  id: string;
  asset: string;
  level: "Critical" | "High" | "Medium" | "Low";
  reason: string;
  score: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
  asset: string;
}

// ─── Navigation Config ────────────────────────────────────────────────────────

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/dashboard" },
  { id: "documents", label: "Documents", icon: "FileText", href: "/documents" },
  { id: "knowledge-twin", label: "Knowledge Twin", icon: "Brain", href: "/knowledge-twin" },
  { id: "copilot", label: "Industrial Copilot", icon: "Bot", href: "/copilot" },
  { id: "knowledge-graph", label: "Knowledge Graph", icon: "Network", href: "/graph" },
  { id: "failure-genome", label: "Failure Genome", icon: "Dna", href: "/failure-genome" },
  { id: "knowledge-risk", label: "Knowledge Risk", icon: "ShieldAlert", href: "/knowledge-risk" },
  { id: "compliance", label: "Compliance Intelligence", icon: "Scale", href: "/compliance" },
  { id: "time-machine", label: "Incident Time Machine", icon: "History", href: "/incidents" },
  { id: "settings", label: "Settings", icon: "Settings", href: "/settings" },
];


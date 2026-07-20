"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, UploadCloud } from "lucide-react";
import Link from "next/link";

// Widgets
import { KpiCardComponent } from "@/components/dashboard/KpiCard";
import { AssetHealthChart } from "@/components/dashboard/AssetHealthChart";
import { KnowledgeRiskHeatmap } from "@/components/dashboard/KnowledgeRiskHeatmap";
import { AssetCard } from "@/components/dashboard/AssetCard";
import { FailureGenomeCard } from "@/components/dashboard/FailureGenomeCard";
import { ComplianceCard } from "@/components/dashboard/ComplianceCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CopilotQuickAccess } from "@/components/dashboard/CopilotQuickAccess";
import { InsightCard } from "@/components/dashboard/InsightCard";

// Skeletons
import {
  KpiCardSkeleton,
  CardSkeleton,
  ChartSkeleton,
} from "@/components/dashboard/Skeletons";

// API
import {
  fetchMetrics,
  fetchAssets,
  fetchKnowledgeRisks,
  fetchFailurePatterns,
  fetchCompliance,
  fetchActivityFeed,
  fetchRecommendations,
  type DashboardMetrics,
  type AssetData,
  type KnowledgeRisk,
  type FailurePattern,
  type ComplianceData,
  type ActivityEvent,
  type Recommendation,
} from "@/lib/document-intelligence";

// ─── KPI card builder ────────────────────────────────────────────────────────

function buildKpiCards(m: DashboardMetrics) {
  return [
    {
      id: "docs",
      title: "Documents Indexed",
      value: m.documents_indexed.toLocaleString(),
      numericValue: m.documents_indexed,
      change: "",
      changeType: "neutral" as const,
      status: "Active",
      statusColor: "green" as const,
      icon: "Factory",
      gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      id: "entities",
      title: "Entities Extracted",
      value: m.total_assets.toLocaleString(),
      numericValue: m.total_assets,
      change: "",
      changeType: "neutral" as const,
      status: "Extracted",
      statusColor: "blue" as const,
      icon: "Brain",
      gradient: "from-purple-500/20 to-violet-500/10",
    },
    {
      id: "risks",
      title: "Knowledge Risk Alerts",
      value: String(m.knowledge_risk_alerts),
      numericValue: m.knowledge_risk_alerts,
      change: "",
      changeType: m.knowledge_risk_alerts > 0 ? "negative" as const : "positive" as const,
      status: m.knowledge_risk_alerts > 0 ? "Evidence Found" : "None Detected",
      statusColor: m.knowledge_risk_alerts > 0 ? "red" as const : "green" as const,
      icon: "AlertTriangle",
      gradient: "from-red-500/20 to-orange-500/10",
    },
    {
      id: "genome",
      title: "Failure Patterns Detected",
      value: String(m.failure_patterns),
      numericValue: m.failure_patterns,
      change: "",
      changeType: "neutral" as const,
      status: m.failure_patterns > 0 ? "Discovered" : "None",
      statusColor: "blue" as const,
      icon: "Shield",
      gradient: "from-green-500/20 to-emerald-500/10",
    },
  ];
}

// ─── State shape ─────────────────────────────────────────────────────────────

interface DashboardState {
  metrics: DashboardMetrics | null;
  assets: AssetData[];
  risks: KnowledgeRisk[];
  patterns: FailurePattern[];
  compliance: ComplianceData[];
  feed: ActivityEvent[];
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

// ─── Section wrapper (simple stagger via index) ───────────────────────────────

function Section({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    metrics: null,
    assets: [],
    risks: [],
    patterns: [],
    compliance: [],
    feed: [],
    recommendations: [],
    loading: true,
    error: null,
    lastRefreshed: null,
  });

  const loadAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [metrics, assets, risks, patterns, compliance, feed, recommendations] =
        await Promise.all([
          fetchMetrics(),
          fetchAssets(),
          fetchKnowledgeRisks(),
          fetchFailurePatterns(),
          fetchCompliance(),
          fetchActivityFeed(),
          fetchRecommendations(),
        ]);
      setState({
        metrics,
        assets,
        risks,
        patterns,
        compliance,
        feed,
        recommendations,
        loading: false,
        error: null,
        lastRefreshed: new Date(),
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Failed to load dashboard data. Please refresh.",
      }));
    }
  }, []);

  useEffect(() => {
    loadAll();
    // Auto-refresh activity feed every 30 seconds
    const interval = setInterval(async () => {
      try {
        const feed = await fetchActivityFeed();
        setState((s) => ({ ...s, feed }));
      } catch {}
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const { metrics, assets, risks, patterns, compliance, feed, recommendations, loading, error, lastRefreshed } = state;
  const kpiCards = metrics ? buildKpiCards(metrics) : [];

  if (!loading && assets.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center min-h-[450px]">
        <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
          <UploadCloud className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 mb-1">
          Industrial Knowledge Twin Ready
        </h1>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
          Upload industrial documents to begin intelligence generation.
        </p>
        <Link href="/documents">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
            <UploadCloud className="w-4.5 h-4.5" />
            Upload Documents
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{error}</span>
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 text-sm font-bold bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-200"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 right-24 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-blue-200 text-xs font-semibold tracking-wide uppercase">
                Knowledge Twin Active · All Systems Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Industrial Knowledge Twin
              <span className="block text-blue-300 text-lg sm:text-xl font-bold">Command Center</span>
            </h1>
            <p className="text-blue-200 text-sm max-w-xl leading-relaxed">
              Monitor asset intelligence, operational risks, compliance health, and
              organizational knowledge in real time.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {loading ? (
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading intelligence…
              </div>
            ) : metrics ? (
              <>
                {[
                  { label: "Graph Nodes", value: metrics.graph_nodes?.toLocaleString() ?? "0", dot: "bg-green-400" },
                  { label: "Graph Edges", value: metrics.graph_edges?.toLocaleString() ?? "0", dot: "bg-blue-300" },
                  { label: "Standards Detected", value: String(metrics.detected_standards ?? 0), dot: "bg-purple-300" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[90px]">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    </div>
                    <p className="text-white font-black text-lg leading-none">{s.value}</p>
                    <p className="text-blue-200 text-[10px] mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </>
            ) : null}

            {lastRefreshed && (
              <button
                onClick={loadAll}
                className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors bg-white/10 rounded-lg px-3 py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <Section delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
            : kpiCards.map((card, i) => (
                <KpiCardComponent key={card.id} card={card} index={i} />
              ))}
        </div>
      </Section>

      {/* ── Charts: Asset Health + Knowledge Risk ── */}
      <Section delay={0.18} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <CardSkeleton rows={5} />
          </>
        ) : (
          <>
            <AssetHealthChart
              healthData={metrics ? [
                { name: "Healthy", value: metrics.asset_health.healthy, color: "#22c55e" },
                { name: "Warning", value: metrics.asset_health.warning, color: "#f59e0b" },
                { name: "Critical", value: metrics.asset_health.critical, color: "#ef4444" },
              ] : []}
              trendData={metrics?.weekly_trend ?? []}
            />
            <KnowledgeRiskHeatmap risks={risks} />
          </>
        )}
      </Section>

      {/* ── Asset Intelligence ── */}
      <Section delay={0.25}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Asset Intelligence Overview</h2>
            <p className="text-xs text-slate-400">Live health, knowledge risk, and compliance per asset</p>
          </div>
          {!loading && assets.length > 0 && (
            <button className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View all {metrics?.total_assets.toLocaleString()} →
            </button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} rows={3} />)}
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            icon="🏭"
            title="No assets discovered yet"
            description="Upload maintenance reports, SOPs, or inspection documents to begin building your asset intelligence graph."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {assets.map((asset, i) => (
              <AssetCard key={asset.id} asset={asset as any} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* ── Failure Genome + Activity Feed ── */}
      <Section delay={0.32} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">Failure Genome Intelligence</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  🧬 AI Innovation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Cross-asset failure patterns discovered by AI</p>
            </div>
            {!loading && patterns.length > 0 && (
              <button className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                View all {metrics?.failure_patterns} →
              </button>
            )}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} rows={2} />)}
            </div>
          ) : patterns.length === 0 ? (
            <EmptyState
              icon="🧬"
              title="No failure patterns discovered yet"
              description="Upload incident reports and maintenance logs to enable Failure Genome AI analysis."
              compact
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {patterns.map((p, i) => (
                <FailureGenomeCard key={p.id} pattern={p as any} index={i} />
              ))}
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <CardSkeleton rows={6} />
          ) : (
            <ActivityFeed feed={feed} />
          )}
        </div>
      </Section>

      {/* ── Compliance + Copilot ── */}
      <Section delay={0.38} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <CardSkeleton rows={4} />
            <CardSkeleton rows={3} />
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Compliance Intelligence</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {compliance.length > 0
                      ? `${compliance.length} standards detected from documents`
                      : "No compliance standards detected yet"}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                  Auto-Audited
                </span>
              </div>
              {compliance.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No compliance data yet"
                  description="Run a compliance audit on uploaded documents to see scores."
                  compact
                />
              ) : (
                <div className="space-y-3">
                  {compliance.map((item, i) => (
                    <ComplianceCard key={item.id} item={item as any} index={i} />
                  ))}
                </div>
              )}
            </div>
            <CopilotQuickAccess />
          </>
        )}
      </Section>

      {/* ── AI Recommendations ── */}
      <Section delay={0.44}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">AI-Generated Recommendations</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                ✨ Live Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Proactive actions from knowledge twin reasoning
            </p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} rows={3} />)}
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon="✨"
            title="No recommendations generated yet"
            description="The AI will generate actionable recommendations after analyzing your uploaded documents."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.map((r, i) => (
              <InsightCard key={r.id} insight={r as any} index={i} />
            ))}
          </div>
        )}
      </Section>

      <div className="h-4" />
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
  compact = false,
}: {
  icon: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 ${
        compact ? "py-10 px-6" : "py-16 px-8"
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
    </motion.div>
  );
}

import { proxyGet } from "../../proxy";

const fallbackMetrics = {
  total_assets: 0,
  knowledge_risk_alerts: 0,
  compliance_score: 100.0,
  failure_patterns: 0,
  documents_indexed: 0,
  ai_queries_today: 0,
  assets_online: 0,
  high_risk_assets: 0,
  asset_health: {
    healthy: 0,
    warning: 0,
    critical: 0,
  },
  weekly_trend: [],
};

export async function GET() {
  return proxyGet("/api/dashboard/metrics", fallbackMetrics);
}

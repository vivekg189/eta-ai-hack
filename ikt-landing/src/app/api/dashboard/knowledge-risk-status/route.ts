import { proxyGet } from "../../proxy";

export async function GET() {
  const fallback = {
    overall_score: 0,
    undocumented_ratio: 0,
    expert_dependencies: [],
    coverage_by_asset: []
  };
  return proxyGet("/api/dashboard/knowledge-risk-status", fallback);
}

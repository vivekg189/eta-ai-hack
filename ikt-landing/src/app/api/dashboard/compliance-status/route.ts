import { proxyGet } from "../../proxy";

export async function GET() {
  const fallback = {
    overall_score: 100,
    standards: [],
    pending_actions: []
  };
  return proxyGet("/api/dashboard/compliance-status", fallback);
}

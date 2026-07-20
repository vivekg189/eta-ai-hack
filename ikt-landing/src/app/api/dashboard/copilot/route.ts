import { proxyPost } from "../../proxy";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const query: string = body.query || "";

  const fallback = {
    response: "AI Copilot assistant is offline. Please start the backend service.",
    source_citations: [],
    intent_detected: "General Query",
    knowledge_graph_nodes_queried: 0,
    vector_chunks_retrieved: 0,
    timestamp: new Date().toISOString(),
  };

  return proxyPost("/api/dashboard/copilot", { query }, fallback);
}

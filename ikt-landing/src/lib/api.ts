// ─── API Response Types ───────────────────────────────────────────────────────

export interface DashboardMetrics {
  total_assets: number;
  knowledge_risk_alerts: number;
  compliance_score: number | null;
  failure_patterns: number;
  documents_indexed: number;
  ai_queries_today: number;
  assets_online: number;
  high_risk_assets: number;
  graph_nodes: number;
  graph_edges: number;
  detected_standards: number;
  detected_risks: number;
  detected_failures: number;
  detected_topics: number;
  asset_health: { healthy: number; warning: number; critical: number };
  weekly_trend: Array<{ day: string; healthy: number; warning: number; critical: number }>;
}

export interface AssetData {
  id: string;
  name: string;
  type: string;
  equipment_id: string;
  health_score: number;
  risk_score: number;
  knowledge_risk: "Critical" | "High" | "Medium" | "Low";
  compliance_score: number;
  status: string;
  documents: number;
  last_updated: string;
  location: string;
}

export interface KnowledgeRisk {
  id: string;
  asset: string;
  title?: string;
  level: "Critical" | "High" | "Medium" | "Low";
  severity?: string;
  category?: string;
  reason: string;
  impact?: string;
  recommendation?: string;
  score: number;
  expert: string | null;
  documents: number;
  evidence?: string;
  source_document?: string;
  confidence?: number;
}

export interface FailurePattern {
  id: string;
  pattern: string;
  cause: string;
  occurrences: number;
  affected_assets: number;
  risk: "Critical" | "High" | "Medium" | "Low";
  trend: "rising" | "stable" | "falling";
  discovered_at: string;
  assets: string[];
  description: string;
}

export interface ComplianceData {
  id: string;
  name: string;
  score: number;
  status: "healthy" | "warning" | "critical";
  last_audit: string;
  gaps: number;
  total_clauses: number;
}

export interface ActivityEvent {
  id: string;
  message: string;
  timestamp: string;
  relative_time: string;
  type: "upload" | "alert" | "compliance" | "discovery" | "maintenance";
  severity: "info" | "warning" | "critical" | "success";
  asset: string | null;
  detail: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
  asset: string;
  confidence: number;
  source_docs: number;
  estimated_impact: string;
}

export interface CopilotResponse {
  response: string;
  source_citations: string[];
  intent_detected: string;
  knowledge_graph_nodes_queried: number;
  vector_chunks_retrieved: number;
  timestamp: string;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

const BASE = "/api/dashboard";

export async function fetchMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE}/metrics`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function fetchAssets(): Promise<AssetData[]> {
  const res = await fetch(`${BASE}/assets`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

export async function fetchKnowledgeRisks(): Promise<KnowledgeRisk[]> {
  const res = await fetch(`${BASE}/knowledge-risks`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch knowledge risks");
  return res.json();
}

export async function fetchFailurePatterns(): Promise<FailurePattern[]> {
  const res = await fetch(`${BASE}/failure-patterns`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch failure patterns");
  return res.json();
}

export async function fetchCompliance(): Promise<ComplianceData[]> {
  const res = await fetch(`${BASE}/compliance`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch compliance");
  return res.json();
}

export async function fetchActivityFeed(): Promise<ActivityEvent[]> {
  const res = await fetch(`${BASE}/activity-feed`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch activity feed");
  return res.json();
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const res = await fetch(`${BASE}/recommendations`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function queryCopilot(query: string, docIds?: string[]): Promise<CopilotResponse> {
  const res = await fetch(`${BASE}/copilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, doc_ids: docIds }),
  });
  if (!res.ok) throw new Error("Copilot query failed");
  return res.json();
}

// ─── Documents API ────────────────────────────────────────────────────────────

export interface DocumentProcessingStep {
  step: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

export interface DocumentData {
  id: string;
  name: string;
  type: string;
  status: "processing" | "completed" | "failed";
  entities_found: number;
  linked_assets: string[];
  upload_date: string;
  file_size: string;
  extracted_text?: string;
  ai_summary?: string;
  processing_history?: DocumentProcessingStep[];
  entities?: Record<string, string[]>;
}

export async function fetchDocuments(): Promise<DocumentData[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadDocument(file: File): Promise<DocumentData> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

export async function fetchDocumentById(id: string): Promise<DocumentData> {
  const res = await fetch(`/api/documents/${id}`);
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
}

// ─── Module API Interfaces ────────────────────────────────────────────────────

export interface MaintenanceEvent {
  date: string;
  type: string;
  description: string;
  technician: string;
  status: "Completed" | "Pending";
}

export interface ComplianceLog {
  standard: string;
  clause: string;
  status: "Compliant" | "Non-Compliant" | "Action Required";
  audit_date: string;
}

export interface AssetTwin {
  id: string;
  name: string;
  type: string;
  health_score: number;
  knowledge_risk: "Critical" | "High" | "Medium" | "Low";
  risk_score: number;
  documents_count: number;
  last_updated: string;
  maintenance_history: MaintenanceEvent[];
  compliance_logs: ComplianceLog[];
  source_documents: string[];
  relationships: string[];
  evidence: string;
  confidence_score: number;
}

export interface GraphNode {
  id: string;
  type: string;
  data: { label: string };
  position: { x: number; y: number };
  style?: React.CSSProperties;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface FailureGenomePattern {
  id: string;
  pattern: string;
  category: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  occurrences: number;
  affected_assets: string[];
  cause: string;
  trend: "rising" | "stable" | "falling";
  discovered_at: string;
  description: string;
  evidence: string;
  recommendation: string;
  remediation: string;
  source_document: string;
  confidence: number;
}

export interface ExpertDependency {
  name: string;
  role: string;
  assets: string[];
  dependency_score: number | null;
  evidence: string;
}

export interface KnowledgeRiskData {
  overall_score: number | null;
  undocumented_ratio: number | null;
  expert_dependencies: ExpertDependency[];
  coverage_by_asset: Array<{ asset: string; coverage: number | null; documents_referenced: number }>;
  evidence_risks: KnowledgeRisk[];
}

export interface ComplianceFinding {
  standard: string;
  area: string;
  requirement: string;
  evidence: string;
  gap: string | null;
  recommendation: string;
  source_document: string;
  confidence: number;
}

export interface StandardMapping {
  standard: string;
  clauses_total: number;
  clauses_compliant: number;
  gaps_detected: string[];
  areas?: string[];
}

export interface ComplianceStatusData {
  overall_score: number | null;
  standards: StandardMapping[];
  pending_actions: string[];
  compliance_findings?: ComplianceFinding[];
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  asset: string;
  event_type: "Alarm Trigger" | "Parameter Deviation" | "Manual Shutdown" | "Recovery";
  description: string;
  severity: "info" | "warning" | "critical" | "success";
  operator: string;
}

export interface IncidentTimeData {
  incident_id: string;
  title: string;
  date: string;
  events: IncidentEvent[];
  root_cause: string;
  corrective_actions: string[];
}

export interface IntelligenceFindings {
  compliance_findings: ComplianceFinding[];
  knowledge_risks: KnowledgeRisk[];
  failure_patterns: FailureGenomePattern[];
}

// ─── Module API HTTP Resolvers ────────────────────────────────────────────────

export async function fetchAssetTwins(): Promise<AssetTwin[]> {
  const res = await fetch("/api/dashboard/assets");
  if (!res.ok) throw new Error("Failed to fetch asset twins");
  return res.json();
}

export async function fetchKnowledgeGraph(): Promise<GraphData> {
  const res = await fetch("/api/dashboard/graph");
  if (!res.ok) throw new Error("Failed to fetch knowledge graph");
  return res.json();
}

export async function fetchFailureGenome(): Promise<FailureGenomePattern[]> {
  const res = await fetch("/api/dashboard/failure-patterns");
  if (!res.ok) throw new Error("Failed to fetch failure genome patterns");
  return res.json();
}

export async function fetchKnowledgeRiskStatus(): Promise<KnowledgeRiskData | null> {
  const res = await fetch("/api/dashboard/knowledge-risk-status");
  if (!res.ok) throw new Error("Failed to fetch knowledge risk status");
  return res.json();
}

export async function fetchComplianceStatus(): Promise<ComplianceStatusData | null> {
  const res = await fetch("/api/dashboard/compliance-status");
  if (!res.ok) throw new Error("Failed to fetch compliance status");
  return res.json();
}

export async function fetchIncidentsTimeline(): Promise<IncidentTimeData | null> {
  const res = await fetch("/api/dashboard/incidents");
  if (!res.ok) throw new Error("Failed to fetch incidents timeline");
  return res.json();
}

export async function fetchIntelligenceFindings(): Promise<IntelligenceFindings> {
  const res = await fetch("/api/dashboard/intelligence", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch intelligence findings");
  return res.json();
}

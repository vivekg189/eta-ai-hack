"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, User, Layers, FileText, Activity, AlertTriangle, UploadCloud, Info } from "lucide-react";
import { fetchKnowledgeRiskStatus, type KnowledgeRiskData, type KnowledgeRisk } from "@/lib/document-intelligence";

export default function KnowledgeRiskPage() {
  const [riskData, setRiskData] = useState<KnowledgeRiskData | null>(null);
  const [selected, setSelected] = useState<KnowledgeRisk | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchKnowledgeRiskStatus();
      setRiskData(data);
      if (data?.evidence_risks?.length) setSelected(data.evidence_risks[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("ikt-documents-updated", loadData);
    return () => window.removeEventListener("ikt-documents-updated", loadData);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  const hasData = riskData && (
    riskData.evidence_risks.length > 0 ||
    riskData.expert_dependencies.length > 0 ||
    riskData.coverage_by_asset.length > 0
  );

  if (!hasData) return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-1">Insufficient Evidence Found</h2>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        Upload documents containing procedures, expert references, compliance checklists, or operational knowledge to detect risks.
      </p>
      <Link href="/documents">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
          <UploadCloud className="w-4.5 h-4.5" />Upload Documents
        </button>
      </Link>
    </div>
  );

  const severityStyle = (level: string) => {
    switch (level) {
      case "High": case "Critical": return "bg-red-50 text-red-700 border-red-200";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence-Based Risks</p>
            <p className="text-3xl font-black text-slate-800">{riskData!.evidence_risks.length}</p>
            <p className="text-[10px] text-slate-400">Derived from document analysis</p>
          </div>
          <span className={`p-3 border rounded-full ${riskData!.evidence_risks.length > 0 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-green-50 border-green-100 text-green-600"}`}>
            <ShieldAlert className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expert Dependencies</p>
            <p className="text-3xl font-black text-slate-800">{riskData!.expert_dependencies.length}</p>
            <p className="text-[10px] text-slate-400">Named personnel found in documents</p>
          </div>
          <span className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-full">
            <User className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indexed Asset Nodes</p>
            <p className="text-3xl font-black text-slate-800">{riskData!.coverage_by_asset.length}</p>
            <p className="text-[10px] text-slate-400">Unique assets mapped from documents</p>
          </div>
          <span className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-full">
            <Layers className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Risk Detail + List */}
      {riskData!.evidence_risks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Risk List */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              Knowledge Risks
            </h3>
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {riskData!.evidence_risks.map((risk) => (
                <button
                  key={risk.id}
                  onClick={() => setSelected(risk)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selected?.id === risk.id
                      ? "border-blue-500 bg-blue-50/20 shadow-sm"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-700 truncate">{risk.title || risk.asset}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${severityStyle(risk.severity || risk.level)}`}>
                      {risk.severity || risk.level}
                    </span>
                  </div>
                  {risk.category && <p className="text-[10px] text-slate-400">{risk.category}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Detail */}
          <div className="lg:col-span-3 space-y-6">
            {selected && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">{selected.title || selected.asset}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Category: {selected.category || "Knowledge Risk"}
                      {selected.source_document && ` · Source: ${selected.source_document}`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border flex-shrink-0 ${severityStyle(selected.severity || selected.level)}`}>
                    {selected.severity || selected.level} Severity
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {selected.evidence && (
                    <div className="p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl md:col-span-2">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Evidence</p>
                      <p className="text-slate-700 italic">"{selected.evidence}"</p>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Potential Impact</p>
                    <p className="text-slate-700">{selected.impact || selected.reason}</p>
                  </div>

                  {selected.recommendation && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-1">
                      <p className="text-[10px] font-bold text-green-700 uppercase">Recommendation</p>
                      <p className="text-green-800">{selected.recommendation}</p>
                    </div>
                  )}
                </div>

                {selected.confidence != null && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />Confidence: {Math.round(selected.confidence * 100)}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expert Dependencies */}
        {riskData!.expert_dependencies.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <User className="w-4.5 h-4.5 text-blue-500" />
              Expert Dependencies
            </h3>
            <div className="space-y-3">
              {riskData!.expert_dependencies.map((exp, idx) => (
                <div key={idx} className="p-3 border border-slate-100 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{exp.name}</span>
                    <span className="text-slate-400 text-[10px]">{exp.role}</span>
                  </div>
                  {exp.assets.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {exp.assets.map(a => (
                        <span key={a} className="text-[9px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-bold">{a}</span>
                      ))}
                    </div>
                  )}
                  {exp.evidence && (
                    <p className="text-[11px] text-slate-400 italic">"{exp.evidence.slice(0, 120)}{exp.evidence.length > 120 ? "..." : ""}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asset Coverage */}
        {riskData!.coverage_by_asset.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <FileText className="w-4.5 h-4.5 text-purple-500" />
              Asset Document Coverage
            </h3>
            <div className="space-y-3">
              {riskData!.coverage_by_asset.map((asset, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 border border-slate-100 rounded-xl">
                  <span className="font-bold text-slate-700">{asset.asset}</span>
                  <span className="text-slate-400">
                    {asset.documents_referenced} document{asset.documents_referenced !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">Coverage % not calculated — requires full procedure inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, FileText, CheckCircle, AlertTriangle, Activity, UploadCloud, ShieldCheck, Info } from "lucide-react";
import { fetchComplianceStatus, type ComplianceStatusData, type ComplianceFinding } from "@/lib/document-intelligence";

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceStatusData | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<ComplianceFinding | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const d = await fetchComplianceStatus();
      setData(d);
      if (d?.compliance_findings?.length) setSelectedFinding(d.compliance_findings[0]);
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

  if (!data || data.standards.length === 0) return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
        <Scale className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-1">No Compliance References Found</h2>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        Upload compliance, audit, or inspection documents to extract standards and requirements.
      </p>
      <Link href="/documents">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
          <UploadCloud className="w-4.5 h-4.5" />Upload Documents
        </button>
      </Link>
    </div>
  );

  const findings = data.compliance_findings ?? [];
  const totalGaps = data.standards.reduce((a, s) => a + s.gaps_detected.length, 0);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Index</p>
            <p className="text-3xl font-black text-slate-800">
              {data.overall_score != null ? `${data.overall_score}%` : "—"}
            </p>
            <p className="text-[10px] text-slate-400">
              {data.overall_score != null ? "Derived from evidence" : "Insufficient evidence to calculate"}
            </p>
          </div>
          <span className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-full shadow-inner">
            <Scale className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standards Detected</p>
            <p className="text-3xl font-black text-slate-800">{data.standards.length}</p>
            <p className="text-[10px] text-slate-400">Extracted from uploaded documents</p>
          </div>
          <span className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-full">
            <FileText className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence-Based Gaps</p>
            <p className="text-3xl font-black text-slate-800">{totalGaps}</p>
            <p className="text-[10px] text-slate-400">Requires documentation or verification</p>
          </div>
          <span className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Findings Detail + Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: compliance findings list */}
        {findings.length > 0 && (
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
              Compliance Areas ({findings.length})
            </h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {findings.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFinding(f)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedFinding === f
                      ? "border-blue-500 bg-blue-50/20 shadow-sm"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-700 truncate">{f.area}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      f.gap && f.gap !== "null"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}>
                      {f.gap && f.gap !== "null" ? "Gap" : "OK"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{f.standard}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: finding detail or standards list */}
        <div className={`${findings.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} space-y-6`}>

          {/* Selected finding detail */}
          {selectedFinding && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">{selectedFinding.area}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Standard: {selectedFinding.standard} · Source: {selectedFinding.source_document}</p>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border flex-shrink-0 ${
                  selectedFinding.gap && selectedFinding.gap !== "null"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}>
                  {selectedFinding.gap && selectedFinding.gap !== "null" ? "Gap Detected" : "Compliant"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Requirement</p>
                  <p className="text-slate-700">{selectedFinding.requirement}</p>
                </div>

                <div className="p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Evidence</p>
                  <p className="text-slate-700 italic">"{selectedFinding.evidence}"</p>
                </div>

                {selectedFinding.gap && selectedFinding.gap !== "null" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Gap</p>
                    <p className="text-amber-800">{selectedFinding.gap}</p>
                  </div>
                )}

                <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-green-700 uppercase">Recommendation</p>
                  <p className="text-green-800">{selectedFinding.recommendation}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" />Confidence: {Math.round((selectedFinding.confidence ?? 0) * 100)}%</span>
                  <span>Source: {selectedFinding.source_document}</span>
                </div>
              </div>
            </div>
          )}

          {/* Standards mapping */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Scale className="w-4.5 h-4.5 text-blue-500" />
              Standards Mapping
            </h3>
            <div className="space-y-4">
              {data.standards.map((std, idx) => {
                const ratio = std.clauses_total > 0 ? std.clauses_compliant / std.clauses_total : 0;
                return (
                  <div key={idx} className="space-y-2 border border-slate-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-bold">{std.standard}</span>
                      <span className="text-slate-500">{std.clauses_compliant} / {std.clauses_total} Areas Covered</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                      <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${ratio * 100}%` }} />
                    </div>
                    {std.areas && std.areas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {std.areas.filter(Boolean).map((a, ai) => (
                          <span key={ai} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold">{a}</span>
                        ))}
                      </div>
                    )}
                    {std.gaps_detected.length > 0 && (
                      <div className="mt-2 p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
                        <span className="text-[9px] font-extrabold text-red-700 uppercase">Gaps</span>
                        {std.gaps_detected.map((gap, i) => (
                          <p key={i} className="text-[11px] text-red-600 font-medium flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />{gap}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Actions */}
          {data.pending_actions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                Pending Actions ({data.pending_actions.length})
              </h3>
              <div className="space-y-2">
                {data.pending_actions.map((act, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className="font-semibold">{act}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

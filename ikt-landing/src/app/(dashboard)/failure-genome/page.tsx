"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dna, ShieldAlert, FileText, Activity, UploadCloud, Info, AlertTriangle
} from "lucide-react";
import { fetchFailureGenome, type FailureGenomePattern } from "@/lib/document-intelligence";

export default function FailureGenomePage() {
  const [patterns, setPatterns] = useState<FailureGenomePattern[]>([]);
  const [selected, setSelected] = useState<FailureGenomePattern | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFailureGenome();
      setPatterns(data);
      if (data.length > 0) setSelected(data[0]);
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

  const riskStyle = (risk: string) => {
    switch (risk) {
      case "Critical": return "bg-red-50 text-red-700 border-red-200";
      case "High": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (patterns.length === 0) return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
        <Dna className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-1">No Failure Patterns Detected</h2>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        Upload incident reports, maintenance logs, inspection reports, or audit findings to extract failure patterns.
      </p>
      <Link href="/documents">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
          <UploadCloud className="w-4.5 h-4.5" />Upload Documents
        </button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Pattern Explorer */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5 flex-shrink-0">
            <Dna className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
            Pattern Explorer
          </h3>
          <div className="space-y-2 mt-4 overflow-y-auto flex-1 pr-1">
            {patterns.map(pat => (
              <button
                key={pat.id}
                onClick={() => setSelected(pat)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  selected?.id === pat.id
                    ? "border-blue-500 bg-blue-50/10 shadow-sm"
                    : "border-slate-200/60 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-700 truncate">{pat.pattern}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{pat.category}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${riskStyle(pat.risk)}`}>
                  {pat.risk}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-3">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    {selected.pattern}
                  </h2>
                  <p className="text-xs text-slate-400">Category: {selected.category} · Source: {selected.source_document}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${riskStyle(selected.risk)}`}>
                  {selected.risk}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Pattern Description</h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    {selected.description}
                  </p>
                </div>

                {/* Evidence */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-500" />
                    Document Evidence
                  </h3>
                  {selected.evidence ? (
                    <div className="p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl">
                      <p className="text-xs text-slate-700 italic leading-relaxed">"{selected.evidence}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Insufficient evidence found.</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Confidence: {Math.round((selected.confidence ?? 0) * 100)}%</span>
                    <span className="truncate max-w-[60%] text-right">{selected.source_document}</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    Recommended Action
                  </h3>
                  <div className="p-4 bg-green-50/50 border border-green-200/60 rounded-xl flex items-start gap-3">
                    <span className="p-1 bg-green-100 border border-green-200 text-green-700 rounded-lg flex-shrink-0">
                      <Info className="w-4 h-4" />
                    </span>
                    <p className="text-xs text-green-800 leading-relaxed">{selected.recommendation || selected.remediation}</p>
                  </div>

                  {selected.source_document && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-bold text-slate-700 truncate">{selected.source_document}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select a failure pattern to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

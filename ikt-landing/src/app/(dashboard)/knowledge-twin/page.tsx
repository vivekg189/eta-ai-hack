"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain, Search, ShieldAlert, FileText, Settings,
  CheckCircle, Activity, ArrowRight, UploadCloud, Info
} from "lucide-react";
import { fetchAssetTwins, type AssetTwin } from "@/lib/document-intelligence";

export default function KnowledgeTwinPage() {
  const [twins, setTwins] = useState<AssetTwin[]>([]);
  const [selected, setSelected] = useState<AssetTwin | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAssetTwins();
      setTwins(data);
      setSelected(prev => {
        if (prev) {
          const found = data.find(t => t.id === prev.id);
          if (found) return found;
        }
        return data[0] ?? null;
      });
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

  const filtered = twins.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  const typeBadge = (type: string) => {
    switch (type) {
      case "Asset": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Equipment Tag": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Operator / Engineer": return "bg-green-50 text-green-700 border-green-200";
      case "Procedure": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Compliance Standard": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Regulation": return "bg-violet-50 text-violet-700 border-violet-200";
      case "Organization": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Failure Pattern": return "bg-red-50 text-red-700 border-red-200";
      case "Topic": return "bg-teal-50 text-teal-700 border-teal-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (twins.length === 0) return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
        <Brain className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-1">No Knowledge Twins generated yet.</h2>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        Upload documents to begin intelligence extraction.
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

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Twin Explorer ({twins.length})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search twins..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filtered.map(twin => (
                <button
                  key={twin.id}
                  onClick={() => setSelected(twin)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    selected?.id === twin.id
                      ? "border-blue-500 bg-blue-50/10 shadow-sm"
                      : "border-slate-200/60 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-700 truncate">{twin.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{twin.type}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-blue-50/50 text-blue-600 border-blue-100 flex-shrink-0">
                    {Math.round(twin.confidence_score * 100)}%
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-4">No matching twins found</p>
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Identity */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
                      <Brain className="w-4 h-4" />
                    </span>
                    <h2 className="text-base font-extrabold text-slate-800">{selected.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge(selected.type)}`}>
                      {selected.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Indexed from {selected.documents_count} source document{selected.documents_count !== 1 ? "s" : ""} · {selected.last_updated}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full shadow-sm flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold">{Math.round(selected.confidence_score * 100)}% Confidence</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Evidence */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-500" />Extraction Evidence
                  </h3>
                  {selected.evidence ? (
                    <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl">
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{selected.evidence}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Insufficient evidence found.</p>
                  )}
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />Direct excerpt from source document raw text.
                  </p>
                </div>

                {/* Source Documents */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />Source Documents
                  </h3>
                  <div className="space-y-2">
                    {(selected.source_documents || []).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-bold text-slate-700 truncate">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationships */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-amber-500" />Connected Entities
                  </h3>
                  {(selected.relationships || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selected.relationships.map((relName, idx) => {
                        const match = twins.find(t => t.name.toLowerCase() === relName.toLowerCase());
                        return (
                          <button
                            key={idx}
                            onClick={() => match ? setSelected(match) : setSearch(relName)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-600 hover:text-blue-700 rounded-xl transition-all font-medium"
                          >
                            <span>{relName}</span>
                            <ArrowRight className="w-3 h-3 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No entity relationships detected from documents.</p>
                  )}
                </div>

                {/* Compliance Logs (conditional) */}
                {selected.compliance_logs?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-purple-500" />Compliance References
                    </h3>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-2">Standard</th>
                          <th className="pb-2">Clause</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selected.compliance_logs.map((log, i) => (
                          <tr key={i} className="text-slate-600">
                            <td className="py-2.5 font-bold">{log.standard}</td>
                            <td className="py-2.5 text-slate-500">{log.clause}</td>
                            <td className="py-2.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                log.status === "Compliant"
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select a twin from the explorer to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

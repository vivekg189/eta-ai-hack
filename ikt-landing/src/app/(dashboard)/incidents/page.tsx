"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  History, Info, AlertTriangle, FileText, CheckCircle2,
  Activity, ArrowRight, UploadCloud, User
} from "lucide-react";
import { fetchIncidentsTimeline, type IncidentTimeData } from "@/lib/document-intelligence";

export default function IncidentTimeMachinePage() {
  const [incident, setIncident] = useState<IncidentTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidentsTimeline();
      setIncident(data);
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

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      case "warning": return "bg-amber-100 text-amber-700 border-amber-200";
      case "success": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!incident || !incident.events || incident.events.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-6">
          <History className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-1">No Reconstructable Timeline Found</h2>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
          No timestamped incident events were detected in uploaded documents.
          Upload incident reports with explicit dates and event descriptions to enable timeline reconstruction.
        </p>
        <Link href="/documents">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
            <UploadCloud className="w-4.5 h-4.5" />
            Upload Incident Reports
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Incident details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Timeline Viewer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 animate-pulse" />
              Incident Reconstruction Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-1">Reconstructed event log for: <strong className="text-slate-600">{incident.title}</strong> ({incident.date})</p>
          </div>

          {/* Timeline events */}
          <div className="relative pl-6 space-y-6 border-l border-slate-100 ml-3">
            {incident.events.map((event, idx) => (
              <div key={event.id} className="relative group">
                {/* Timeline Dot indicator */}
                <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                  event.severity === "critical" ? "bg-red-500 animate-ping" : event.severity === "warning" ? "bg-amber-400" : "bg-green-500"
                }`} />
                <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                  event.severity === "critical" ? "bg-red-500" : event.severity === "warning" ? "bg-amber-400" : "bg-green-500"
                }`} />

                <div className="bg-slate-50/50 border border-slate-100 hover:border-slate-200 rounded-xl p-4 space-y-2 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700">{event.event_type}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{event.timestamp}</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-normal font-semibold">{event.description}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Operator: <strong className="text-slate-500">{event.operator}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getSeverityStyle(event.severity)}`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cause, corrective actions and links */}
        <div className="space-y-6">
          
          {/* Causal/Root cause analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <AlertTriangle className="w-4.5 h-4.5 text-orange-500" />
              AI Causal Attribution
            </h3>

            <div className="space-y-3 text-xs leading-relaxed">
              <p className="font-semibold text-slate-700 bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
                {incident.root_cause}
              </p>
              <p className="text-slate-400 leading-normal">
                Derived by parsing temporal correlation coefficients between sensor deviations and maintenance logs.
              </p>
            </div>
          </div>

          {/* Corrective actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              Mitigation Actions
            </h3>

            <div className="space-y-3">
              {incident.corrective_actions.map((act, i) => (
                <div key={i} className="p-3 bg-green-50/50 border border-green-100 rounded-xl text-xs text-green-800 leading-normal flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                  <p className="font-bold">{act}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Source Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-blue-500" />
              Source Report
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Timeline reconstructed from ingested document content.
              Upload additional incident reports for expanded timeline coverage.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

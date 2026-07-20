"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Cpu, Database, Network, Key, Layers, Activity,
  Sliders, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const [plantName, setPlantName] = useState("IKT Command Hub");
  const [selectedLLM, setSelectedLLM] = useState("groq-llama-3-70b");
  const [chunkSize, setChunkSize] = useState(512);

  const systemStatus = [
    { label: "Frontend Shell", status: "Active", details: "Port 3000 Running", color: "green" },
    { label: "Neo4j Graph Database", status: "Not Connected", details: "No Active Session", color: "amber" },
    { label: "ChromaDB Vector Store", status: "Not Connected", details: "Client Connection Pending", color: "amber" },
    { label: "Groq LLM Engine", status: "Not Configured", details: "API Key Required", color: "amber" },
    { label: "Backend API Router", status: "Not Connected", details: "Simulated Resolvers Active", color: "amber" }
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case "green": return "bg-green-500 border-green-200 text-green-700 bg-green-50/50";
      default: return "bg-amber-500 border-amber-200 text-amber-700 bg-amber-50/50";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Config Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Config */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4.5 h-4.5 text-blue-600" />
              General Preferences
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Plant Identity Name</label>
                <input
                  type="text"
                  value={plantName}
                  onChange={e => setPlantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Operational Region Code</label>
                <input
                  type="text"
                  disabled
                  value="IND-WEST-MAH-01"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI Config */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="w-4.5 h-4.5 text-purple-500" />
              AI Model Configuration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Primary Inference Model</label>
                <select
                  value={selectedLLM}
                  onChange={e => setSelectedLLM(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl transition-all font-medium text-slate-700"
                >
                  <option value="groq-llama-3-70b">Llama 3 70B (via Groq Inference)</option>
                  <option value="groq-mixtral-8x22b">Mixtral 8x22B (via Groq Inference)</option>
                  <option value="openai-gpt-4o">GPT-4o (Direct API)</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Vector Chunk Token Size</label>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={e => setChunkSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl transition-all"
                />
              </div>
            </div>
          </div>

          {/* Storage Buffers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4.5 h-4.5 text-cyan-600" />
              Document Cache Settings
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Cache Eviction Strategy</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">
                  <option>Least Recently Used (LRU)</option>
                  <option>Least Frequently Used (LFU)</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Max Local Buffer Size</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">
                  <option>512 MB (Default)</option>
                  <option>1024 MB</option>
                  <option>2048 MB</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Connection Telemetry */}
        <div className="space-y-6">
          
          {/* System status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-blue-500" />
                Integration Status
              </h3>
              
              <button className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {systemStatus.map((sys, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${getStatusColor(sys.color)}`}>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 truncate">{sys.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sys.details}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      sys.color === "green" ? "bg-green-500 animate-pulse" : "bg-amber-500"
                    }`} />
                    <span className="font-bold tracking-wide uppercase text-[9px]">
                      {sys.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API keys section placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Key className="w-4.5 h-4.5 text-purple-500" />
              Developer Credentials
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Neo4j Bolt URI</label>
                <input
                  type="text"
                  placeholder="bolt://localhost:7687"
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Groq API Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

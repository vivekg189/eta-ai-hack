"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot, Send, FileText, Database, Cpu,
  HelpCircle, Trash2, UploadCloud, Loader2, User, AlertTriangle, CheckCircle
} from "lucide-react";
import { queryCopilot, fetchDocuments, type CopilotResponse } from "@/lib/document-intelligence";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  responseDetails?: CopilotResponse;
  isError?: boolean;
}

const SUGGESTED = [
  "Show active knowledge gaps and expert dependencies",
  "What safety compliance requirements are documented?",
  "Summarize failure patterns found in uploaded documents",
  "What procedures are referenced in these documents?",
];

// ─── Render structured ## sections from Groq markdown output ─────────────────

function StructuredResponse({ text }: { text: string }) {
  // Split on markdown ## headings
  const sections = text.split(/\n(?=## )/).map(s => s.trim()).filter(Boolean);

  if (sections.length <= 1) {
    // Plain text — render as-is
    return (
      <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">{text}</p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => {
        const headingMatch = section.match(/^## (.+)\n?([\s\S]*)/);
        if (!headingMatch) return (
          <p key={i} className="text-xs text-slate-600 whitespace-pre-wrap">{section}</p>
        );
        const [, heading, body] = headingMatch;
        const headingLower = heading.toLowerCase();

        const headingColor =
          headingLower.includes("answer") ? "text-blue-700 border-blue-200 bg-blue-50" :
          headingLower.includes("evidence") ? "text-indigo-700 border-indigo-200 bg-indigo-50" :
          headingLower.includes("source") ? "text-slate-600 border-slate-200 bg-slate-50" :
          headingLower.includes("confidence") ? "text-emerald-700 border-emerald-200 bg-emerald-50" :
          "text-slate-700 border-slate-200 bg-slate-50";

        return (
          <div key={i} className={`rounded-xl border px-3 py-2.5 ${headingColor}`}>
            <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1.5 opacity-70">{heading}</p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{body.trim()}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Groq status indicator ────────────────────────────────────────────────────

function GroqStatusBadge({ lastResponse }: { lastResponse: CopilotResponse | null }) {
  if (!lastResponse) return null;
  const used = (lastResponse as any).groq_used;
  if (used === undefined) return null;

  return used ? (
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <CheckCircle className="w-3 h-3" /> Groq LLM Active
    </span>
  ) : (
    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> Groq Unavailable
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CopilotPage() {
  const [docsCount, setDocsCount] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDetails, setActiveDetails] = useState<CopilotResponse | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const checkDocs = async () => {
    try {
      const list = await fetchDocuments();
      setDocsCount(list.length);
    } catch {
      setDocsCount(0);
    }
  };

  useEffect(() => {
    checkDocs();
    window.addEventListener("ikt-documents-updated", checkDocs);
    return () => window.removeEventListener("ikt-documents-updated", checkDocs);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const ts = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "user", text, timestamp: ts }]);
    setInput("");
    setLoading(true);

    try {
      const res = await queryCopilot(text);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: "copilot",
        text: res.response,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        responseDetails: res
      }]);
      setActiveDetails(res);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: "copilot",
        text: "Error connecting to the Copilot backend. Please ensure the backend is running.",
        timestamp: ts,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (docsCount === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (docsCount === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
          <Bot className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-1">No Knowledge Base Available</h2>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
          Upload documents to activate Industrial Copilot reasoning.
        </p>
        <Link href="/documents">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
            <UploadCloud className="w-4.5 h-4.5" />
            Upload Documents
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 overflow-hidden">

        {/* ── Chat Interface ── */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
                <Bot className="w-4.5 h-4.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Industrial AI Copilot</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Groq LLM · Evidence-Based Reasoning · Document-Grounded
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GroqStatusBadge lastResponse={activeDetails} />
              <button
                onClick={() => { setMessages([]); setActiveDetails(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/20">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center h-full max-w-sm mx-auto space-y-3">
                <Bot className="w-10 h-10 text-blue-400 opacity-60" />
                <h4 className="text-xs font-bold text-slate-700">Evidence-Based Industrial Intelligence</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every answer is reasoned from your uploaded documents via Groq LLM.
                  No hardcoded answers. No fabricated data.
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "ml-auto flex-row-reverse max-w-[70%]" : "max-w-[90%]"}`}
              >
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-slate-100 text-slate-600 border-slate-200"
                    : msg.isError
                      ? "bg-red-50 text-red-500 border-red-100"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  {msg.sender === "user" ? (
                    <div className="p-3.5 rounded-2xl rounded-tr-none bg-blue-600 text-white text-xs font-medium shadow-sm shadow-blue-200">
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      onClick={() => msg.responseDetails && setActiveDetails(msg.responseDetails)}
                      className={`p-4 rounded-2xl rounded-tl-none border transition-all cursor-pointer ${
                        msg.isError
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <StructuredResponse text={msg.text} />
                    </div>
                  )}
                  <p className={`text-[9px] text-slate-400 px-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Retrieving evidence · Reasoning with Groq LLM...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 flex-shrink-0 space-y-3 bg-white">
            {messages.length === 0 && (
              <div className="flex gap-2 flex-wrap">
                {SUGGESTED.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-[10px] font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5 opacity-60" />
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask the Industrial Copilot..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 pl-4 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shadow-blue-200 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ── RAG Pipeline Inspector ── */}
        <div className="xl:col-span-1 space-y-4 overflow-y-auto pr-1 h-full">

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-500" />
              RAG Pipeline Telemetry
            </h3>

            {activeDetails ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-xl text-center">
                    <p className="text-purple-800 font-black text-lg leading-none">
                      {activeDetails.knowledge_graph_nodes_queried}
                    </p>
                    <p className="text-purple-600 text-[9px] mt-1 font-semibold uppercase">Chunks Queried</p>
                  </div>
                  <div className="bg-cyan-50 border border-cyan-100 p-2.5 rounded-xl text-center">
                    <p className="text-cyan-800 font-black text-lg leading-none">
                      {activeDetails.vector_chunks_retrieved}
                    </p>
                    <p className="text-cyan-600 text-[9px] mt-1 font-semibold uppercase">Chunks Used</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-500 text-[10px] uppercase">Detected Intent</p>
                  <p className="text-slate-700 bg-slate-50 border border-slate-200/50 p-2 rounded-xl font-bold text-[11px]">
                    {activeDetails.intent_detected}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-500 text-[10px] uppercase">Reasoning Engine</p>
                  <p className={`text-[11px] font-bold px-2 py-1 rounded-lg border w-fit ${
                    (activeDetails as any).groq_used
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {(activeDetails as any).groq_used ? "Groq LLM (llama-3.3-70b)" : "Groq Unavailable"}
                  </p>
                </div>

                {activeDetails.source_citations.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-slate-500 text-[10px] uppercase">Source Documents</p>
                    <div className="space-y-1.5">
                      {activeDetails.source_citations.map((cite, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/40">
                          <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="font-bold text-slate-700 truncate text-[10px]">{cite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 py-2">
                Submit a question to see RAG pipeline telemetry.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-500" />
              Pipeline Architecture
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-500">
              {[
                "1. Query → Embedding",
                "2. ChromaDB Vector Search",
                "3. Top-K Chunk Retrieval",
                "4. Groq LLM Reasoning",
                "5. Structured Evidence Answer",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {step}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

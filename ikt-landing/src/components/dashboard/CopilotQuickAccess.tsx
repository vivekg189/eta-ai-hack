"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ArrowRight, FileText } from "lucide-react";
import { queryCopilot } from "@/lib/document-intelligence";

const SUGGESTIONS = [
  "Explain compliance guidelines",
  "Show recurring failure patterns",
  "Identify knowledge gaps across all assets"
];

interface CopilotResult {
  response: string;
  source_citations: string[];
  knowledge_graph_nodes_queried: number;
  vector_chunks_retrieved: number;
}

export function CopilotQuickAccess() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await queryCopilot(query.trim());
      setResult(data);
    } catch {
      setError("Copilot unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Ask Industrial Copilot</h3>
          </div>
          <p className="text-xs text-slate-400 ml-9">ChromaDB + Neo4j + Groq reasoning</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : "bg-blue-500 animate-pulse"}`} />
          <span className={`text-xs font-semibold ${isLoading ? "text-amber-600" : "text-blue-600"}`}>
            {isLoading ? "Processing…" : "AI Ready"}
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask a question about your documents..."
          disabled={isLoading}
          className="w-full pr-12 pl-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Suggestions */}
      <div className="mb-4">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Suggested Prompts</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              onClick={() => handleSuggestion(s)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-100 font-medium transition-colors"
            >
              <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Response area */}
      <AnimatePresence>
        {(isLoading || result || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 pt-4"
          >
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-white" />
              </div>

              {isLoading ? (
                <div className="flex-1">
                  <div className="flex items-center gap-1 mt-1.5 mb-2">
                    {[0, 0.15, 0.3].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">Querying knowledge graph…</span>
                  </div>
                  <div className="space-y-1.5">
                    {[100, 80, 60].map((w) => (
                      <div
                        key={w}
                        className="h-2.5 rounded bg-slate-100 animate-pulse"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : result ? (
                <div className="flex-1">
                  <p className="text-sm text-slate-700 leading-relaxed">{result.response}</p>

                  {/* Source citations */}
                  {result.source_citations.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sources</p>
                      <div className="flex flex-wrap gap-1">
                        {result.source_citations.map((src) => (
                          <span
                            key={src}
                            className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-medium"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Graph stats */}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>🕸 {result.knowledge_graph_nodes_queried} graph nodes queried</span>
                    <span>📄 {result.vector_chunks_retrieved} chunks retrieved</span>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

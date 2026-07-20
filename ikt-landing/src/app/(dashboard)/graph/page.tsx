"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Network, Search, Info, Database, Layers, ArrowUpRight, UploadCloud,
  FileText, Cpu
} from "lucide-react";
import {
  ReactFlow, Background, Controls, useNodesState, useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { fetchKnowledgeGraph } from "@/lib/document-intelligence";

export default function KnowledgeGraphPage() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const graph = await fetchKnowledgeGraph();
      if (graph.nodes.length > 0) {
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setHasData(true);
      } else {
        setHasData(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
    window.addEventListener("ikt-documents-updated", loadGraph);
    return () => window.removeEventListener("ikt-documents-updated", loadGraph);
  }, []);

  const getConnectedEdges = (nodeId: string) =>
    edges.filter((e: any) => e.source === nodeId || e.target === nodeId);

  const filteredNodes = nodes.filter((n: any) =>
    n.data.label.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Network className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!hasData) return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner animate-pulse">
        <Network className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-1">Knowledge Graph Not Generated</h2>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        Upload documents to create evidence-based entity relationships.
      </p>
      <Link href="/documents">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200">
          <UploadCloud className="w-4.5 h-4.5" />Upload Documents
        </button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 overflow-hidden">

        {/* Node Explorer */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="space-y-4 flex-shrink-0 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5 text-blue-600" />
              Node Explorer ({nodes.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNodes.map((node: any) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                  selectedNode?.id === node.id
                    ? "border-blue-500 bg-blue-50/10 shadow-sm font-bold text-blue-700"
                    : "border-slate-100 hover:bg-slate-50 text-slate-600 font-medium"
                }`}
              >
                <span className="truncate">{node.data.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm h-full overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] text-slate-500 font-semibold shadow-sm flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Click nodes to inspect evidence-based relationships.
          </div>
          <div className="w-full h-full">
            <ReactFlow
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_: any, node: any) => setSelectedNode(node)}
              fitView
              attributionPosition="bottom-right"
            >
              <Background color="#cbd5e1" gap={16} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* Relationship Inspector */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col h-full overflow-hidden">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5 flex-shrink-0">
            <Database className="w-4 h-4 text-cyan-500" />Relationship Inspector
          </h3>

          {selectedNode ? (
            <div className="flex-1 overflow-y-auto pt-4 space-y-5 text-xs pr-1">
              <div className="space-y-2">
                <p className="font-bold text-slate-400 text-[10px] uppercase">Node</p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700">
                  {selectedNode.data.label}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-400 text-[10px] uppercase">ID</p>
                <code className="block p-2 bg-slate-100 rounded font-mono text-[10px] text-slate-600 break-all">
                  {selectedNode.id}
                </code>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-slate-400 text-[10px] uppercase">
                  Graph Links ({getConnectedEdges(selectedNode.id).length})
                </p>
                <div className="space-y-2">
                  {getConnectedEdges(selectedNode.id).map((edge: any) => {
                    const isSource = edge.source === selectedNode.id;
                    const connectedId = isSource ? edge.target : edge.source;
                    const connectedNode = nodes.find((n: any) => n.id === connectedId);
                    return (
                      <div key={edge.id} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{isSource ? "→ Out" : "← In"}</span>
                          <span className="text-blue-600 uppercase font-bold text-[9px]">{edge.label || "RELATED_TO"}</span>
                        </div>
                        <p className="font-bold text-slate-700 truncate">
                          {connectedNode?.data.label || connectedId}
                        </p>
                        {edge.evidence && (
                          <p className="text-[10px] text-slate-400 italic leading-relaxed border-l-2 border-slate-300 pl-2 mt-1">
                            "{edge.evidence.slice(0, 100)}{edge.evidence.length > 100 ? "..." : ""}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {getConnectedEdges(selectedNode.id).length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No connected nodes identified.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <Cpu className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
              <p className="text-[11px]">Select a node to inspect evidence-based relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

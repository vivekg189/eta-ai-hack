"use client";

import { useState, useRef, DragEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2,
  Eye, Trash2, ArrowRight, Search, Database, Sparkles, Cpu,
  BookOpen, FileCheck2, Network, Scale, History, Calendar,
  ArrowUpRight, Info, FileSpreadsheet, FileImage
} from "lucide-react";
import {
  fetchDocuments,
  uploadDocument,
  fetchDocumentById,
  deleteDocument,
  type DocumentData,
  type DocumentProcessingStep
} from "@/lib/document-intelligence";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Real uploads in progress
  const [uploads, setUploads] = useState<Array<{
    id: string;
    name: string;
    size: string;
    progress: number;
    step: string;
    type: string;
  }>>([]);

  const refreshDocs = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const reprocessAll = async () => {
    try {
      await fetch("/api/documents/reprocess", { method: "POST" });
      // Poll for completion
      setTimeout(() => {
        refreshDocs();
        window.dispatchEvent(new Event("ikt-documents-updated"));
      }, 4000);
    } catch (err) {
      console.error("Reprocess failed:", err);
    }
  };

  useEffect(() => {
    refreshDocs();
    const handleUpdate = () => {
      refreshDocs();
    };
    window.addEventListener("ikt-documents-updated", handleUpdate);
    return () => window.removeEventListener("ikt-documents-updated", handleUpdate);
  }, []);

  const handleDocumentClick = async (doc: DocumentData) => {
    try {
      const fullDoc = await fetchDocumentById(doc.id);
      setSelectedDoc(fullDoc);
    } catch (err) {
      console.error("Failed to load document details:", err);
      setSelectedDoc(doc);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.linked_assets && doc.linked_assets.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Check upload state
  const isProcessing = uploads.length > 0;

  // File type helper
  const getFileType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png"].includes(ext)) return "image";
    return ext;
  };

  // Real upload handler
  const startRealUpload = (files: File[]) => {
    files.forEach(async file => {
      const tempId = Math.random().toString(36).substring(7);
      const ext = getFileType(file.name);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";

      const newUpload = {
        id: tempId,
        name: file.name,
        size: sizeStr,
        progress: 10,
        step: "Uploading file to server...",
        type: ext.toUpperCase()
      };

      setUploads(prev => [...prev, newUpload]);

      try {
        const uploaded = await uploadDocument(file);
        
        setUploads(prev =>
          prev.map(u => (u.id === tempId ? { ...u, progress: 30, step: "AI Pipeline Ingestion..." } : u))
        );

        // Poll document status
        const pollInterval = setInterval(async () => {
          try {
            const docDetail = await fetchDocumentById(uploaded.id);
            if (docDetail.status !== "processing") {
              clearInterval(pollInterval);
              setUploads(prev => prev.filter(u => u.id !== tempId));
              refreshDocs();
              window.dispatchEvent(new Event("ikt-documents-updated"));
            } else {
              setUploads(prev =>
                prev.map(u => {
                  if (u.id === tempId) {
                    const nextProgress = Math.min(u.progress + 15, 95);
                    let step = "Extracting entities...";
                    if (nextProgress > 80) step = "Updating Knowledge Graph...";
                    else if (nextProgress > 50) step = "ChromaDB vector embedding...";
                    return { ...u, progress: nextProgress, step };
                  }
                  return u;
                })
              );
            }
          } catch (err) {
            clearInterval(pollInterval);
            setUploads(prev => prev.filter(u => u.id !== tempId));
          }
        }, 2000);

      } catch (error) {
        console.error("Upload error:", error);
        setUploads(prev => prev.filter(u => u.id !== tempId));
      }
    });
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const validExtensions = ["pdf", "docx", "xlsx", "csv", "png", "jpg", "jpeg"];
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        return ext && validExtensions.includes(ext);
      });

      if (droppedFiles.length > 0) {
        startRealUpload(droppedFiles);
      }
    }
  };

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startRealUpload(Array.from(e.target.files));
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDocument(id);
      refreshDocs();
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
      window.dispatchEvent(new Event("ikt-documents-updated"));
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Document Intelligence Center</h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Upload industrial documents and transform them into actionable operational intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold transition-all ${
            isProcessing
              ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isProcessing ? "bg-amber-500" : "bg-green-500"}`} />
            {isProcessing ? `AI Ingestion Busy (${uploads.length})` : "Pipeline Idle"}
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200"
          >
            <UploadCloud className="w-4.5 h-4.5" />
            Upload Documents
          </button>
        </div>
      </div>

      {/* ── Main Section: File Manager & Active Upload Progress ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Upload Zone and Uploads Progress */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Custom Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white ${
              dragActive
                ? "border-blue-500 bg-blue-50/20 scale-[0.99]"
                : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
              onChange={handleFileBrowse}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              Drop industrial documents here or click to browse
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-3">
              Supports PDF, DOCX, XLSX, CSV, PNG, JPG, JPEG (Max size: 50MB)
            </p>
            <div className="flex gap-2 flex-wrap justify-center opacity-65">
              {["PDF", "DOCX", "Excel", "CSV", "Images"].map(tag => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 uppercase">{tag}</span>
              ))}
            </div>
          </div>

          {/* Active Simulating Upload Progress Section */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <h3 className="text-sm font-bold text-slate-800">Processing Pipeline</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                    {uploads.length} Active Ingests
                  </span>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {uploads.map(up => (
                    <div key={up.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4.5 h-4.5 text-blue-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{up.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{up.size}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${up.progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      
                      {/* Step Indicator */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-semibold text-blue-600">{up.step}</span>
                        <span>{up.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Ingest Pipeline Visual Diagram */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-500" />
              AI Pipeline Architecture
            </h3>
            
            <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 ml-3">
              {[
                { title: "Document Upload", desc: "Multipart parsing, size check, metadata indexing.", icon: UploadCloud, color: "text-blue-500 bg-blue-50 border-blue-100" },
                { title: "OCR Extraction", desc: "PaddleOCR scans layouts, tables, and handwritten marks.", icon: Cpu, color: "text-purple-500 bg-purple-50 border-purple-100" },
                { title: "Entity Recognition", desc: "NER identifies tag codes, sensor labels, and actions.", icon: Sparkles, color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
                { title: "Knowledge Graph Linking", desc: "Resolves synonym tags and creates Neo4j relationships.", icon: Network, color: "text-cyan-500 bg-cyan-50 border-cyan-100" },
                { title: "Knowledge Twin Update", desc: "Compiles embeddings, summaries, and risk indexes.", icon: Database, color: "text-emerald-500 bg-emerald-50 border-emerald-100" }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Circle Icon */}
                    <div className={`absolute -left-[37px] top-0 w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm ${step.color} z-10 transition-transform group-hover:scale-110`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        {step.title}
                        {idx === 4 && <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full animate-pulse">Live</span>}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Document Table or Empty State */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Uploaded Documents</h3>
                <p className="text-xs text-slate-400">Manage and browse operational files indexed in the graph database</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search index..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl w-full sm:w-[220px] transition-all"
                />
              </div>
            </div>

            {/* Document Table Render */}
            {documents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
                {/* Onboarding illustration: Scanner SVG */}
                <div className="w-44 h-44 mb-6 relative">
                  <div className="absolute inset-0 bg-blue-50 rounded-full opacity-60 animate-pulse" />
                  <svg className="w-full h-full text-blue-500 relative z-10" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                    <rect x="35" y="32" width="30" height="40" rx="3" stroke="currentColor" strokeWidth="2.5" fill="white" />
                    <line x1="42" y1="42" x2="58" y2="42" stroke="currentColor" strokeWidth="2" />
                    <line x1="42" y1="50" x2="58" y2="50" stroke="currentColor" strokeWidth="2" />
                    <line x1="42" y1="58" x2="52" y2="58" stroke="currentColor" strokeWidth="2" />
                    <motion.line
                      x1="30" y1="45" x2="70" y2="45"
                      stroke="#3b82f6" strokeWidth="3"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Documents Uploaded</h3>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
                  Upload your first document to start building your Industrial Knowledge Twin.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-[1.02]"
                >
                  Upload Documents
                </button>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <Info className="w-10 h-10 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">No matching documents</h4>
                <p className="text-xs text-slate-400 max-w-xs">No entries match your search criteria "{searchQuery}"</p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                      <th className="pb-3 pl-2">File Name</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-center">Entities</th>
                      <th className="pb-3">Linked Assets</th>
                      <th className="pb-3">Upload Date</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredDocs.map(doc => (
                      <tr
                        key={doc.id}
                        onClick={() => handleDocumentClick(doc)}
                        className="hover:bg-slate-50/50 cursor-pointer group transition-colors"
                      >
                        <td className="py-3.5 pl-2 font-bold text-slate-700">
                          <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[300px]">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">{doc.type}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            doc.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : doc.status === "failed"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === "completed" ? "bg-green-500" : doc.status === "failed" ? "bg-red-500" : "bg-amber-500"
                            }`} />
                            {doc.status || "ready"}
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-bold text-blue-600">{doc.entities_found ?? 0}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1 max-w-[150px] overflow-hidden truncate">
                            {(doc.linked_assets || []).map(asset => (
                              <span key={asset} className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/50 px-1.5 py-0.5 rounded">
                                {asset}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-400 font-medium">{doc.upload_date}</td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentClick(doc);
                              }}
                              className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteDocument(doc.id, e)}
                              className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Document Categories Section ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Support Modules by Category</h3>
          <p className="text-xs text-slate-400">Different categories classify documentation rules for twin ingestion mappings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: "Maintenance Records",
              desc: "Classifies technician notes, checklists, and repair logs.",
              ai: "Pins MTTR / MTBF failures, maps wear anomalies.",
              out: "Asset failure genome matching templates.",
              icon: History,
              color: "text-blue-600 bg-blue-50 border-blue-100"
            },
            {
              title: "Inspection Reports",
              desc: "Non-destructive testing (NDT), wall loss parameters, pressure records.",
              ai: "Predicts remaining structural useful life values.",
              out: "Asset safety metrics, health score trends.",
              icon: FileCheck2,
              color: "text-orange-600 bg-orange-50 border-orange-100"
            },
            {
              title: "P&ID Drawings",
              desc: "Piping & instrumentation engineering vector drafts.",
              ai: "Parses loops, instruments, sensor tags into layout logic.",
              out: "Knowledge Graph schematic connections.",
              icon: Network,
              color: "text-cyan-600 bg-cyan-50 border-cyan-100"
            },
            {
              title: "Operating Procedures",
              desc: "Standard Operating Procedures (SOPs), emergency lists.",
              ai: "Verifies steps against action telemetry outputs.",
              out: "AI recommendations, hazard mitigations.",
              icon: BookOpen,
              color: "text-emerald-600 bg-emerald-50 border-emerald-100"
            },
            {
              title: "Compliance Documents",
              desc: "Local act regulations, OISD codes, ISO logs.",
              ai: "Audits operational safety rules mapping clauses.",
              out: "Automated real-time compliance scoring.",
              icon: Scale,
              color: "text-purple-600 bg-purple-50 border-purple-100"
            },
            {
              title: "Incident Reports",
              desc: "Unscheduled shutdowns, root cause analysis files.",
              ai: "Identifies systemic failure signatures and trends.",
              out: "Time machine timelines, alerts list.",
              icon: AlertCircle,
              color: "text-red-600 bg-red-50 border-red-100"
            }
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800">{cat.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{cat.desc}</p>
                  
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                    <div className="flex gap-1.5">
                      <span className="font-extrabold text-blue-600">AI Task:</span>
                      <span className="text-slate-500 font-medium leading-normal">{cat.ai}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="font-extrabold text-purple-600">Output:</span>
                      <span className="text-slate-500 font-medium leading-normal">{cat.out}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Document Intelligence Capabilities ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Document Intelligence Capabilities</h3>
          <p className="text-xs text-slate-400">Core extraction features processing every ingested page</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "OCR Extraction", desc: "OCR for industrial assets and engineering schedules.", icon: Cpu, delay: 0 },
            { label: "Entity Recognition", desc: "Identifies tags, equipment, and sensors.", icon: Sparkles, delay: 0.05 },
            { label: "Graph Generation", desc: "Dynamic schema generation in Neo4j database.", icon: Network, delay: 0.1 },
            { label: "AI Summarization", desc: "Translates long SOPs into brief briefs.", icon: BookOpen, delay: 0.15 },
            { label: "Compliance Mapping", desc: "Aligns procedures with compliance acts.", icon: Scale, delay: 0.2 },
            { label: "Pattern Detection", desc: "Unfolds recurring degradation patterns.", icon: History, delay: 0.25 }
          ].map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: cap.delay }}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 text-center group cursor-default transition-all shadow-sm flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 mb-2 transition-colors">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{cap.label}</h4>
                <p className="text-[9px] text-slate-400 leading-normal">{cap.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Document Details Modal ── */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">{selectedDoc.name}</h3>
                    <p className="text-[10px] text-slate-400">Ingested {selectedDoc.upload_date} · {selectedDoc.file_size}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left panel: Text extract and AI summary */}
                <div className="lg:col-span-2 space-y-6">
                  {/* AI Summary */}
                  <div className="bg-blue-50/40 rounded-2xl border border-blue-100/50 p-5 space-y-2">
                    <h4 className="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                      AI Executive Summary
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedDoc.ai_summary}
                    </p>
                  </div>

                  {/* Extracted Text */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-700">Raw Extracted Text (OCR)</h4>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 font-mono text-[11px] text-slate-500 leading-relaxed h-[220px] overflow-y-auto whitespace-pre-line">
                      {selectedDoc.extracted_text}
                    </div>
                  </div>
                </div>

                {/* Right panel: Metadata & entities list */}
                <div className="space-y-6">
                  {/* Entity tagging */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      Extracted Entities ({selectedDoc.entities_found})
                    </h4>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDoc.entities ? (
                        Object.entries(selectedDoc.entities)
                          .filter(([_, list]) => Array.isArray(list))
                          .flatMap(([category, list]) => 
                            ((list as string[]) || []).map((ent: string) => ({ category, ent }))
                          ).map(({ category, ent }) => (
                            <span key={`${category}-${ent}`} className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 transition-colors">
                              {ent} <span className="opacity-60 text-[9px] uppercase ml-1">({category})</span>
                            </span>
                          ))
                      ) : (
                        <span className="text-[10px] text-slate-400">No entities classified.</span>
                      )}
                    </div>
                  </div>

                  {/* Linked Assets */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                      <Network className="w-4 h-4 text-cyan-600" />
                      Linked Asset Nodes
                    </h4>
                    <div className="space-y-1.5">
                      {(selectedDoc.linked_assets || []).map(asset => (
                        <div key={asset} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/50 text-[11px]">
                          <span className="font-bold text-slate-700">{asset}</span>
                          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5">
                            Graph Linked <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-700">Processing History</h4>
                    <div className="space-y-2.5">
                      {selectedDoc.processing_history?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="text-[11px]">
                            <p className="font-semibold text-slate-700">{step.step}</p>
                            <p className="text-[9px] text-slate-400">{step.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Drag & Drop Overlay Modal (when user clicks Upload) ── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800">Upload Operational Documents</h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={(e) => {
                  handleDrop(e);
                  setIsUploadModalOpen(false);
                }}
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsUploadModalOpen(false);
                }}
                className={`flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/20"
                    : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/30"
                }`}
              >
                <UploadCloud className="w-10 h-10 text-blue-500 mb-3" />
                <p className="text-xs font-bold text-slate-700 mb-1">Click to select or drop files here</p>
                <p className="text-[10px] text-slate-400">PDF, DOCX, XLSX, CSV, PNG, JPG, JPEG</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

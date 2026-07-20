import os
import shutil
import uuid
import json
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Imports backend configuration & persistence
from config import UPLOAD_DIR, HOST, PORT, GROQ_API_KEY
from database import init_db, get_db_connection, add_activity_log
from services.parser_service import parse_document
from services.groq_service import analyze_document_text, generate_document_intelligence
from services.chroma_service import add_document_to_vector_store, search_vector_store
from services.neo4j_service import build_knowledge_graph_nodes, close_graph_driver
from services.copilot_service import reason_over_evidence, groq_available
import services.dashboard_service as ds

app = FastAPI(title="Industrial Knowledge Twin API Platform", version="1.0.0")

# Setup CORS for frontend proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB init
@app.on_event("startup")
def on_startup():
    init_db()

    # ── Groq API Key Validation ───────────────────────────────────────────────
    if not GROQ_API_KEY or GROQ_API_KEY == "YOUR_GROQ_API_KEY_HERE":
        print("[WARNING] GROQ_API_KEY not found. Industrial Copilot reasoning disabled.")
        print("[WARNING] Add GROQ_API_KEY to ikt-backend/.env to enable LLM reasoning.")
    else:
        try:
            from groq import Groq
            test_client = Groq(api_key=GROQ_API_KEY)
            # Lightweight validation — just instantiating the client is enough
            print("[SUCCESS] Groq connected successfully. Industrial Copilot reasoning enabled.")
        except Exception as e:
            print(f"[WARNING] Groq client init failed: {e}. Copilot reasoning disabled.")

    try:
        ds.update_intelligence_store()
    except Exception as e:
        print(f"Startup intelligence store sync failed: {e}")

    add_activity_log("maintenance", "Industrial Knowledge Twin platform backend started.", "info", "System Hub", "Initialized SQLite metadata storage.")

@app.on_event("shutdown")
def on_shutdown():
    close_graph_driver()

# Background Processing Worker
def process_document_pipeline(doc_id: str, file_path: str, filename: str):
    try:
        # Step 1: OCR / Text Parsing
        print(f"[{doc_id}] Launching text parsing...")
        add_activity_log("upload", f"Started parsing file: {filename}", "info", None, f"Initiating document format check.")
        raw_text = parse_document(file_path, filename)
        
        # Step 2: Groq NLP extraction
        print(f"[{doc_id}] Extracting entities using Groq...")
        add_activity_log("discovery", f"Extracting entities from {filename} via Llama-3.3 Model.", "info", None, f"Scanning vocabulary parameters.")
        extraction = analyze_document_text(raw_text)
        
        # Step 3: SQLite save
        conn = get_db_connection()
        cursor = conn.cursor()

        # Step 3a: Run intelligence generation (second Groq pass)
        print(f"[{doc_id}] Generating document intelligence...")
        intelligence = generate_document_intelligence(raw_text, filename, extraction)
        extraction["_intelligence"] = intelligence

        cursor.execute(
            "INSERT INTO extracted_data (document_id, summary, raw_text, entities) VALUES (?, ?, ?, ?)",
            (doc_id, extraction["summary"], raw_text, json.dumps(extraction))
        )
        cursor.execute(
            "UPDATE documents SET status = 'completed' WHERE id = ?",
            (doc_id,)
        )
        conn.commit()
        conn.close()

        # Step 4: Index Vector Store (ChromaDB)
        print(f"[{doc_id}] Indexing vector embeddings...")
        add_document_to_vector_store(doc_id, filename, raw_text)

        # Step 5: Generate Neo4j Graph relations
        print(f"[{doc_id}] Indexing Graph database relationships...")
        build_knowledge_graph_nodes(doc_id, filename, extraction)

        # Step 6: Sync Central Intelligence Store
        print(f"[{doc_id}] Synchronizing Central Intelligence Store...")
        ds.update_intelligence_store()

        # Log completion
        assets = extraction.get("assets", [])
        asset_mention = assets[0] if assets else "Entity Node"
        add_activity_log(
            "discovery", 
            f"Successfully processed: {filename}.", 
            "success", 
            asset_mention, 
            f"Ingested {len(raw_text)} chars. Extracted document type: {extraction.get('document_type', 'Unknown')}"
        )
        print(f"[{doc_id}] Ingestion pipeline completed successfully.")

    except Exception as e:
        print(f"[{doc_id}] Processing pipeline crashed: {e}")
        # Mark as failed in DB
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE documents SET status = 'failed' WHERE id = ?", (doc_id,))
            conn.commit()
            conn.close()
        except:
            pass
        add_activity_log("alert", f"Ingestion failed for {filename}.", "critical", None, f"Pipeline Error detail: {str(e)}")


# ─── REST ENDPOINTS ────────────────────────────────────────────────────────────

@app.post("/api/documents/upload")
def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        doc_id = str(uuid.uuid4())
        filename = file.filename
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
        
        # Save file to uploads folder
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(file_path)
        size_str = f"{(file_size / (1024 * 1024)):.2f} MB"
        
        # Insert metadata as processing
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO documents (id, name, type, size, upload_date, status, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (doc_id, filename, filename.split(".")[-1].upper(), size_str, datetime.now().strftime("%d %b %Y"), "processing", file_path)
        )
        conn.commit()
        conn.close()

        # Log upload trigger
        add_activity_log("upload", f"Ingested raw document: {filename}", "info", None, f"Saved file to upload store.")

        # Dispatch background parsing worker
        background_tasks.add_task(process_document_pipeline, doc_id, file_path, filename)
        
        return {"id": doc_id, "status": "processing", "name": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate document upload: {e}")

@app.get("/api/documents")
def get_all_documents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, type, size, upload_date, status FROM documents ORDER BY upload_date DESC")
    rows = cursor.fetchall()
    conn.close()
    
    docs = []
    for r in rows:
        docs.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "file_size": r["size"],
            "upload_date": r["upload_date"],
            "status": r["status"]
        })
    return docs

@app.get("/api/documents/{doc_id}")
def get_document_by_id(doc_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, type, size, upload_date, status FROM documents WHERE id = ?", (doc_id,))
    doc_row = cursor.fetchone()
    
    if not doc_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")
        
    cursor.execute("SELECT summary, raw_text, entities FROM extracted_data WHERE document_id = ?", (doc_id,))
    ext_row = cursor.fetchone()
    conn.close()
    
    doc = {
        "id": doc_row["id"],
        "name": doc_row["name"],
        "type": doc_row["type"],
        "file_size": doc_row["size"],
        "upload_date": doc_row["upload_date"],
        "status": doc_row["status"]
    }
    
    if ext_row:
        doc["extracted_text"] = ext_row["raw_text"]
        doc["ai_summary"] = ext_row["summary"]
        parsed_ent = json.loads(ext_row["entities"])
        entities_data = parsed_ent.get("entities", parsed_ent)
        
        # Count all entities across lists
        all_count = 0
        for cat in ["assets", "equipment", "people", "procedures", "standards", "regulations", "failures", "organizations", "topics"]:
            items = entities_data.get(cat, [])
            if isinstance(items, list):
                all_count += len(items)
                
        doc["entities_found"] = all_count
        doc["linked_assets"] = entities_data.get("assets", [])
        doc["entities"] = entities_data
        
    return doc

@app.delete("/api/documents/{doc_id}")
def delete_document_by_id(doc_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path, name FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")
        
    file_path = row["file_path"]
    filename = row["name"]
    
    # Delete SQLite records
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    cursor.execute("DELETE FROM extracted_data WHERE document_id = ?", (doc_id,))
    conn.commit()
    conn.close()
    
    # Delete local filesystem file
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing file from disk: {e}")
            
    # Sync Central Intelligence Store
    try:
        ds.update_intelligence_store()
    except Exception as e:
        print(f"Error syncing intelligence store after document deletion: {e}")
        
    add_activity_log("upload", f"Removed index for document: {filename}", "warning", None, "Purged parsed assets references.")
    return {"message": "Document successfully deleted"}


@app.post("/api/documents/reprocess")
def reprocess_all_documents(background_tasks: BackgroundTasks):
    """Re-run extraction pipeline on all completed documents with the current extraction logic."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, file_path FROM documents WHERE status = 'completed'")
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return {"message": "No completed documents to reprocess.", "count": 0}
    
    def reprocess_all():
        for row in rows:
            doc_id = row["id"]
            file_path = row["file_path"]
            filename = row["name"]
            try:
                raw_text = parse_document(file_path, filename)
                extraction = analyze_document_text(raw_text)
                intelligence = generate_document_intelligence(raw_text, filename, extraction)
                extraction["_intelligence"] = intelligence
                conn2 = get_db_connection()
                c2 = conn2.cursor()
                c2.execute(
                    "UPDATE extracted_data SET summary = ?, raw_text = ?, entities = ? WHERE document_id = ?",
                    (extraction["summary"], raw_text, json.dumps(extraction), doc_id)
                )
                conn2.commit()
                conn2.close()
                print(f"[reprocess] Completed: {filename}")
            except Exception as e:
                print(f"[reprocess] Failed for {filename}: {e}")
        try:
            ds.update_intelligence_store()
            print("[reprocess] Intelligence store updated.")
        except Exception as e:
            print(f"[reprocess] Store sync failed: {e}")
    
    background_tasks.add_task(reprocess_all)
    return {"message": f"Reprocessing {len(rows)} documents in background.", "count": len(rows)}



@app.get("/api/dashboard/metrics")
def get_metrics():
    return ds.get_dashboard_metrics()

@app.get("/api/dashboard/assets")
def get_assets():
    return ds.get_asset_intelligence()

@app.get("/api/dashboard/failure-patterns")
def get_failure_patterns():
    return ds.get_failure_patterns()

@app.get("/api/dashboard/compliance")
def get_compliance():
    status_data = ds.get_compliance_status()
    compliance_list = []
    for idx, s in enumerate(status_data.get("standards", [])):
        total = s["clauses_total"] or 1
        score = int((s["clauses_compliant"] / total) * 100)
        status = "healthy" if score >= 85 else "warning" if score >= 65 else "critical"
        compliance_list.append({
            "id": f"comp-{idx+1}",
            "name": s["standard"],
            "score": score,
            "status": status,
            "last_audit": "Extracted from document",
            "gaps": len(s["gaps_detected"]),
            "total_clauses": s["clauses_total"]
        })
    return compliance_list

@app.get("/api/dashboard/compliance-status")
def get_compliance_status_detailed():
    return ds.get_compliance_status()

@app.get("/api/dashboard/intelligence")
def get_intelligence_findings():
    return ds.get_intelligence_findings()


@app.get("/api/dashboard/knowledge-risks")
def get_knowledge_risks():
    return ds.get_dashboard_knowledge_risks()

@app.get("/api/dashboard/knowledge-risk-status")
def get_knowledge_risk_status():
    return ds.get_knowledge_risk_status()

@app.get("/api/dashboard/graph")
def get_graph():
    return ds.get_knowledge_graph_data()

@app.get("/api/dashboard/activity-feed")
def get_activity_feed():
    return ds.get_activity_feed_data()

@app.get("/api/dashboard/recommendations")
def get_recommendations():
    return ds.get_ai_recommendations()

@app.get("/api/dashboard/incidents")
def get_incidents():
    return ds.get_incidents_timeline()



# ─── COPILOT RAG API ────────────────────────────────────────────────────────────

class CopilotQuery(BaseModel):
    query: str
    doc_ids: list = None  # Optional: restrict to specific document IDs

@app.post("/api/dashboard/copilot")
def query_copilot_assistant(payload: CopilotQuery):
    query = payload.query.strip()

    # Guard: no documents uploaded
    docs = ds.get_all_extracted_records()
    if not docs:
        return {
            "response": "No documents are currently uploaded to the knowledge base. Please upload documents to begin.",
            "source_citations": [],
            "intent_detected": "No Documents",
            "knowledge_graph_nodes_queried": 0,
            "vector_chunks_retrieved": 0,
            "timestamp": datetime.now().isoformat(),
            "groq_used": False
        }

    # Determine active document scope (isolation)
    active_doc_ids = payload.doc_ids if payload.doc_ids else [d["document_id"] for d in docs]

    # Retrieve relevant chunks — scoped to active documents only
    raw_chunks = search_vector_store(query, doc_ids=active_doc_ids, limit=6)

    # Ensure chunks are dicts with text + doc_name
    chunks = [
        c if isinstance(c, dict) else {"text": c, "doc_name": "Uploaded Document"}
        for c in raw_chunks
    ]

    # Delegate ALL reasoning to copilot_service
    return reason_over_evidence(query, chunks)

# ─── RUN SERVER ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

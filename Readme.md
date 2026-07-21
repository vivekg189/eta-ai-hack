# Industrial Knowledge Twin (IKT)

> An AI-powered platform that transforms industrial documents into actionable operational intelligence — featuring knowledge graph generation, compliance auditing, failure pattern analysis, and an evidence-based RAG copilot.

Built for the **ET AI Hackathon 2026**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Document Processing Pipeline](#document-processing-pipeline)
- [API Reference](#api-reference)
- [Dashboard Pages](#dashboard-pages)
- [Services](#services)
- [Database Schema](#database-schema)
- [Known Limitations](#known-limitations)

---

## Overview

The Industrial Knowledge Twin platform ingests industrial documents (PDFs, DOCX, XLSX, images) and runs a multi-stage AI pipeline to extract entities, build knowledge graphs, detect compliance gaps, identify failure patterns, and surface knowledge risks — all grounded in document evidence.

Key capabilities:

- **Document Intelligence** — OCR + LLM-based entity extraction from any industrial document
- **Knowledge Graph** — Auto-generated entity relationship graph (Neo4j + ChromaDB)
- **Compliance Intelligence** — Automated gap analysis against detected standards (OSHA, ISO, OISD, etc.)
- **Failure Genome** — AI-detected failure patterns and risk signatures
- **Knowledge Risk** — Expert dependency mapping and undocumented procedure detection
- **Industrial Copilot** — RAG-powered Q&A grounded strictly in uploaded document evidence
- **Incident Timeline** — Reconstructed event timelines from timestamped document content

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ikt-landing (Next.js)                   │
│  Landing Page → Dashboard → 9 Intelligence Modules          │
│  API Routes proxy all requests to FastAPI backend           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (localhost:8000)
┌────────────────────────▼────────────────────────────────────┐
│                    ikt-backend (FastAPI)                     │
│                                                             │
│  Upload → Parse → Groq Pass 1 → Groq Pass 2 → Store        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ SQLite   │  │ ChromaDB │  │  Neo4j   │  │Intelligence│  │
│  │ Metadata │  │ Vectors  │  │  Graph   │  │   Store   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | 0.110+ | REST API framework |
| Uvicorn | 0.28+ | ASGI server |
| Groq SDK | 1.5+ | LLM inference (llama-3.3-70b-versatile) |
| PyMuPDF | 1.28+ | PDF text extraction |
| python-docx | 1.1+ | DOCX parsing |
| openpyxl | 3.1+ | XLSX parsing |
| ChromaDB | 1.x | Vector embeddings & semantic search |
| Neo4j | 5.18+ | Knowledge graph (optional) |
| SQLite | built-in | Document metadata & activity logs |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.x | React framework |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Recharts | 3.x | Charts & visualizations |
| React Flow (@xyflow) | 12.x | Interactive knowledge graph canvas |
| Lucide React | 1.x | Icons |

---

## Project Structure

```
eta-ai-hack/
├── ikt-backend/                    # Python FastAPI backend
│   ├── services/
│   │   ├── parser_service.py       # Multi-format document text extraction
│   │   ├── groq_service.py         # Two-pass LLM entity + intelligence extraction
│   │   ├── copilot_service.py      # RAG reasoning pipeline
│   │   ├── chroma_service.py       # Vector store operations
│   │   ├── neo4j_service.py        # Knowledge graph node/edge builder
│   │   ├── dashboard_service.py    # Intelligence store read/write + all dashboard data
│   │   └── ocr_service.py          # Image OCR
│   ├── intelligence_store/         # JSON files (auto-generated after document upload)
│   │   ├── extracted_entities.json
│   │   ├── extracted_relationships.json
│   │   ├── compliance_references.json
│   │   ├── knowledge_risks.json
│   │   ├── extracted_incidents.json
│   │   ├── extracted_topics.json
│   │   └── intelligence_findings.json
│   ├── data/
│   │   ├── chroma/                 # ChromaDB vector store
│   │   └── ikt_database.db         # SQLite database
│   ├── uploads/                    # Uploaded document files
│   ├── test_documents/             # Sample documents for testing
│   ├── main.py                     # FastAPI app + all REST endpoints
│   ├── database.py                 # SQLite schema + helpers
│   ├── config.py                   # Environment config loader
│   ├── requirements.txt
│   └── .env                        # Environment variables
│
├── ikt-landing/                    # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/        # All dashboard pages
│       │   │   ├── dashboard/      # Main KPI command center
│       │   │   ├── documents/      # Document upload & management
│       │   │   ├── copilot/        # RAG-powered AI chat
│       │   │   ├── compliance/     # Compliance gap analysis
│       │   │   ├── knowledge-risk/ # Knowledge risk heatmap
│       │   │   ├── failure-genome/ # Failure pattern explorer
│       │   │   ├── graph/          # Interactive knowledge graph
│       │   │   ├── incidents/      # Incident timeline reconstruction
│       │   │   ├── knowledge-twin/ # Entity twin explorer
│       │   │   └── settings/
│       │   ├── api/                # Next.js API routes (proxy to FastAPI)
│       │   │   ├── dashboard/      # Dashboard data endpoints
│       │   │   ├── documents/      # Document CRUD endpoints
│       │   │   └── proxy.ts        # Backend proxy helper
│       │   └── page.tsx            # Landing page
│       ├── components/
│       │   ├── dashboard/          # All dashboard UI components
│       │   └── sections/           # Landing page sections
│       └── lib/
│           ├── api.ts              # All TypeScript API types + fetch helpers
│           └── document-intelligence.ts
│
└── Readme.md
```

---

## Getting Started

### Prerequisites

- **Python 3.10 – 3.13** (Python 3.14 has limited package support)
- **Node.js 18+** and **npm**
- **Groq API Key** — free at [console.groq.com](https://console.groq.com)
- **Neo4j** *(optional)* — only needed for graph relationship persistence

---

### Backend Setup

**1. Navigate to the backend directory**
```bash
cd ikt-backend
```

**2. Install dependencies**
```bash
pip install fastapi uvicorn python-multipart "groq>=1.5.0" python-dotenv \
    python-docx openpyxl neo4j PyMuPDF chromadb
```

**3. Configure environment variables**

Create or edit `ikt-backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here

# Optional — defaults shown
# NEO4J_URI=bolt://localhost:7687
# NEO4J_USER=neo4j
# NEO4J_PASSWORD=password
# CHROMADB_PATH=./data/chroma
# DB_PATH=./data/ikt_database.db
# PORT=8000
# HOST=0.0.0.0
```

**4. Start the backend server**
```bash
python main.py
```

Backend runs at: `http://localhost:8000`

> Neo4j is optional. If not running, the system gracefully falls back to SQLite for all graph data.

---

### Frontend Setup

**1. Navigate to the frontend directory**
```bash
cd ikt-landing
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the development server**
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

> The Next.js API routes automatically proxy all requests to the FastAPI backend at `localhost:8000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | — | Groq API key for LLM inference |
| `NEO4J_URI` | No | `bolt://localhost:7687` | Neo4j connection URI |
| `NEO4J_USER` | No | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | No | `password` | Neo4j password |
| `CHROMADB_PATH` | No | `./data/chroma` | ChromaDB persistence path |
| `DB_PATH` | No | `./data/ikt_database.db` | SQLite database path |
| `PORT` | No | `8000` | Backend server port |
| `HOST` | No | `0.0.0.0` | Backend server host |

---

## Document Processing Pipeline

When a document is uploaded, it goes through a 6-step background pipeline:

```
Step 1 — Parse
  PDF → PyMuPDF text extraction
  DOCX → python-docx paragraph extraction
  XLSX → openpyxl sheet/row extraction
  CSV/TXT → raw text read
  PNG/JPG → OCR via ocr_service

Step 2 — Groq Pass 1: Entity Extraction (llama-3.3-70b-versatile)
  Extracts: document_type, summary, topics, organizations, people,
            assets, equipment, procedures, standards, regulations,
            dates, failures, keywords, relationships
  Falls back to regex-based keyword parser if Groq unavailable

Step 3 — Groq Pass 2: Intelligence Generation
  Generates: compliance_findings, knowledge_risks,
             failure_patterns, graph_relationships
  All findings are evidence-grounded with exact document quotes

Step 4 — SQLite Persistence
  Saves document metadata + extracted entities to ikt_database.db

Step 5 — ChromaDB Vector Indexing
  Chunks document text (800 chars, 150 overlap)
  Indexes chunks with doc_id + doc_name metadata for RAG retrieval

Step 6 — Intelligence Store Sync
  Compiles all extracted data into JSON files in intelligence_store/
  These files serve as the single source of truth for all dashboard modules
```

---

## API Reference

### Documents

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload a document (triggers background pipeline) |
| `GET` | `/api/documents` | List all uploaded documents |
| `GET` | `/api/documents/{id}` | Get document details + extracted entities |
| `DELETE` | `/api/documents/{id}` | Delete document and purge all related data |
| `POST` | `/api/documents/reprocess` | Re-run extraction pipeline on all completed documents |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/metrics` | KPI metrics (entities, risks, failures, graph stats) |
| `GET` | `/api/dashboard/assets` | All extracted entity twins |
| `GET` | `/api/dashboard/failure-patterns` | Detected failure genome patterns |
| `GET` | `/api/dashboard/compliance` | Compliance scores per standard |
| `GET` | `/api/dashboard/compliance-status` | Detailed compliance findings + gaps |
| `GET` | `/api/dashboard/knowledge-risks` | Knowledge risk list |
| `GET` | `/api/dashboard/knowledge-risk-status` | Expert dependencies + asset coverage |
| `GET` | `/api/dashboard/graph` | Knowledge graph nodes + edges |
| `GET` | `/api/dashboard/activity-feed` | Real-time activity log (last 20 events) |
| `GET` | `/api/dashboard/recommendations` | AI-generated action recommendations |
| `GET` | `/api/dashboard/incidents` | Incident timeline reconstruction |
| `GET` | `/api/dashboard/intelligence` | Raw LLM intelligence findings |
| `POST` | `/api/dashboard/copilot` | RAG copilot query |

### Copilot Request Body
```json
{
  "query": "What safety compliance requirements are documented?",
  "doc_ids": ["optional-doc-id-1", "optional-doc-id-2"]
}
```

---

## Dashboard Pages

| Route | Description |
|---|---|
| `/` | Landing page with product overview |
| `/dashboard` | Command center — KPIs, asset health, activity feed, recommendations |
| `/documents` | Upload, manage, and inspect processed documents |
| `/copilot` | Evidence-based RAG chat with RAG pipeline telemetry |
| `/compliance` | Compliance scores, gap analysis, standards mapping |
| `/knowledge-risk` | Knowledge risk heatmap, expert dependencies, asset coverage |
| `/failure-genome` | Failure pattern explorer with evidence and remediation |
| `/graph` | Interactive knowledge graph canvas (React Flow) |
| `/incidents` | Incident timeline reconstruction from timestamped documents |
| `/knowledge-twin` | Entity twin explorer with relationships and compliance logs |

> All pages show a guided empty state when no documents have been uploaded yet.

---

## Services

### `groq_service.py`
Handles two-pass LLM extraction using `llama-3.3-70b-versatile`:
- **Pass 1** — Entity extraction (assets, people, procedures, standards, failures, etc.)
- **Pass 2** — Intelligence generation (compliance findings, knowledge risks, failure patterns, typed graph relationships)
- Falls back to regex-based keyword parser when Groq API is unavailable

### `copilot_service.py`
RAG reasoning pipeline:
1. Detects query intent (Compliance / Failure / Knowledge Risk / Maintenance / Incident)
2. Retrieves top-K relevant chunks from ChromaDB
3. Sends evidence + query to Groq LLM with strict grounding rules
4. Returns structured `## Answer / ## Evidence / ## Source / ## Confidence` response

### `dashboard_service.py`
Central intelligence aggregator:
- Reads/writes all `intelligence_store/*.json` files
- Compiles entity twins, relationships, compliance references, knowledge risks, incidents
- Serves all dashboard API endpoints from pre-computed store files

### `chroma_service.py`
Vector store operations:
- Chunks documents into 800-character overlapping segments
- Indexes with `doc_id` and `doc_name` metadata
- Supports scoped search (restrict to specific document IDs for RAG isolation)

### `neo4j_service.py`
Knowledge graph builder (optional):
- Creates `Document`, `Asset`, `Engineer`, `Failure`, `Procedure`, `ComplianceRule` nodes
- Builds typed relationships: `REFERENCES`, `MAINTAINED_BY`, `HAS_FAILURE`, `USES_PROCEDURE`, `RELATED_TO`
- Gracefully skips if Neo4j is not running

### `parser_service.py`
Multi-format document parser:
- PDF → PyMuPDF
- DOCX → python-docx
- XLSX → openpyxl
- CSV/TXT → built-in csv reader
- PNG/JPG/JPEG → OCR service

---

## Database Schema

### SQLite (`ikt_database.db`)

**`documents`**
```sql
id TEXT PRIMARY KEY
name TEXT
type TEXT          -- file extension (PDF, DOCX, etc.)
size TEXT          -- human-readable size string
upload_date TEXT
status TEXT        -- processing | completed | failed
file_path TEXT
```

**`extracted_data`**
```sql
document_id TEXT PRIMARY KEY  -- FK → documents.id
summary TEXT                  -- AI-generated summary
raw_text TEXT                 -- full extracted text
entities TEXT                 -- JSON blob (all extracted entities + intelligence)
```

**`activity_logs`**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
timestamp TEXT
type TEXT      -- upload | alert | compliance | discovery | maintenance
message TEXT
severity TEXT  -- info | warning | critical | success
asset TEXT
detail TEXT
```

### Intelligence Store (`intelligence_store/`)

| File | Contents |
|---|---|
| `extracted_entities.json` | All entity twins with metadata, relationships, evidence |
| `extracted_relationships.json` | Entity-to-entity relationship edges |
| `compliance_references.json` | Standards with clause counts and detected gaps |
| `knowledge_risks.json` | Evidence-based knowledge risks |
| `extracted_incidents.json` | Timestamped incident events |
| `extracted_topics.json` | Document topics and keywords |
| `intelligence_findings.json` | Raw LLM Pass 2 output (compliance, risks, failures) |

---

## Known Limitations

- **Python 3.14** — Some packages (`pydantic==2.6.4`, `chromadb==0.4.24`) require MSVC build tools on Python 3.14. Use Python 3.10–3.13 for best compatibility, or install unpinned latest versions.
- **Neo4j** — Optional. All graph data falls back to SQLite + JSON store if Neo4j is not running.
- **Incident Timeline** — Only populates if uploaded documents contain sentences with explicit timestamps (e.g. `14:32 PM`, `2024-01-15`) AND incident keywords (`alarm`, `shutdown`, `trip`, etc.).
- **Groq API** — Without a valid `GROQ_API_KEY`, entity extraction falls back to regex-based parsing and the Copilot returns a degraded response. Intelligence generation (Pass 2) is disabled entirely.
- **No Authentication** — The platform has no login/auth system. All routes are publicly accessible.
- **File Size** — LLM extraction is limited to the first 12,000 characters of each document per Groq API call.

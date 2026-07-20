"""
Industrial Copilot Reasoning Service
─────────────────────────────────────
Pipeline: Query → ChromaDB Retrieval → Groq Reasoning → Structured Answer
Every answer is grounded in retrieved document evidence only.
"""

import os
import json
from datetime import datetime

# ─── GROQ CLIENT ──────────────────────────────────────────────────────────────

_groq_client = None
_groq_init_attempted = False

def _get_groq_client():
    """Always reads GROQ_API_KEY fresh from env — never caches a None result."""
    global _groq_client, _groq_init_attempted

    # If we already have a working client, reuse it
    if _groq_client is not None:
        return _groq_client

    # Read key fresh every call until we succeed
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key or key == "YOUR_GROQ_API_KEY_HERE":
        print("[Copilot] GROQ_API_KEY not set or is placeholder.")
        return None

    try:
        from groq import Groq
        _groq_client = Groq(api_key=key)
        print("[Copilot] Groq client initialized successfully.")
        return _groq_client
    except Exception as e:
        print(f"[Copilot] Failed to initialize Groq client: {e}")
        return None


def groq_available() -> bool:
    return _get_groq_client() is not None


# ─── INTENT DETECTION ─────────────────────────────────────────────────────────

def _detect_intent(query: str) -> str:
    q = query.lower()
    if any(w in q for w in ["compliance", "standard", "regulation", "audit", "clause", "osha", "iso", "peso", "oisd"]):
        return "Compliance Audit Validation"
    if any(w in q for w in ["failure", "breakdown", "downtime", "fault", "defect", "anomaly", "root cause"]):
        return "Failure Pattern Analysis"
    if any(w in q for w in ["risk", "gap", "dependency", "knowledge", "expert", "tribal", "undocumented"]):
        return "Knowledge Risk Assessment"
    if any(w in q for w in ["maintenance", "repair", "inspection", "calibration", "overhaul", "service"]):
        return "Maintenance Intelligence Query"
    if any(w in q for w in ["incident", "timeline", "event", "shutdown", "emergency", "accident"]):
        return "Incident Timeline Analysis"
    return "Knowledge Base Query"


# ─── REASONING PROMPT ─────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an Industrial Knowledge Intelligence Assistant embedded in a document-driven platform.

Your ONLY knowledge source is the retrieved document evidence provided below.

STRICT RULES:
1. Never invent assets, equipment, engineers, or procedures not mentioned in the evidence.
2. Never create compliance findings not supported by the evidence.
3. Never fabricate percentages, scores, or statistics.
4. If the evidence does not answer the question, say exactly: "I could not find sufficient evidence in the uploaded documents to answer this question."
5. Always cite the specific evidence sentence(s) that support each point.
6. Generate INSIGHTS and ANALYSIS from the evidence — do NOT dump raw text back.

RESPONSE FORMAT — always use this exact structure:

## Answer
[Your structured, reasoned answer here — use bullet points or numbered lists for clarity]

## Evidence
[For each key claim, quote the exact supporting sentence from the retrieved context]

## Source Document
[Document filename(s) from the context metadata]

## Confidence
[High / Medium / Low — based on how directly the evidence answers the question]"""


def _build_user_prompt(query: str, chunks: list[dict]) -> str:
    if not chunks:
        return f"Query: {query}\n\nNo document evidence was retrieved."

    evidence_block = ""
    for i, chunk in enumerate(chunks):
        doc_name = chunk.get("doc_name", "Unknown Document")
        text = chunk.get("text", "").strip()
        evidence_block += f"\n[Chunk {i+1} from: {doc_name}]\n{text}\n"

    return (
        f"Retrieved Document Evidence:\n{evidence_block}\n"
        f"─────────────────────────────\n"
        f"User Question: {query}\n\n"
        f"Generate an evidence-based analytical response. "
        f"Reason over the evidence — do not return raw text. "
        f"If knowledge gaps, expert dependencies, or risks are asked about, "
        f"derive them from what the evidence implies is required but may be missing."
    )


# ─── MAIN REASONING FUNCTION ──────────────────────────────────────────────────

def reason_over_evidence(query: str, chunks: list[dict]) -> dict:
    """
    Core reasoning function.
    Takes query + retrieved chunks, returns structured answer dict.
    Never falls back to raw chunk dumps.
    """
    citations = list(dict.fromkeys(
        c.get("doc_name", "Uploaded Document") for c in chunks if c.get("doc_name")
    ))
    intent = _detect_intent(query)

    # ── No chunks retrieved ───────────────────────────────────────────────────
    if not chunks:
        return {
            "response": "No supporting evidence found in uploaded documents.",
            "source_citations": [],
            "intent_detected": intent,
            "knowledge_graph_nodes_queried": 0,
            "vector_chunks_retrieved": 0,
            "timestamp": datetime.now().isoformat(),
            "groq_used": False
        }

    client = _get_groq_client()

    # ── Groq reasoning path ───────────────────────────────────────────────────
    if client:
        try:
            user_prompt = _build_user_prompt(query, chunks)
            chat = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                max_tokens=1500
            )
            answer = chat.choices[0].message.content.strip()

            if len(answer) < 30:
                raise ValueError("Groq returned an empty or too-short response")

            return {
                "response": answer,
                "source_citations": citations,
                "intent_detected": intent,
                "knowledge_graph_nodes_queried": len(chunks),
                "vector_chunks_retrieved": len(chunks),
                "timestamp": datetime.now().isoformat(),
                "groq_used": True
            }

        except Exception as e:
            import traceback
            print(f"[Copilot] Groq reasoning failed: {e}")
            print(traceback.format_exc())
            # Fall through to honest fallback — but no raw dump

    # ── Fallback ──────────────────────────────────────────────────────────────
    doc_list = ", ".join(citations) if citations else "uploaded documents"
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if key and key != "YOUR_GROQ_API_KEY_HERE":
        # Key exists but Groq call failed
        fallback_msg = (
            f"## Answer\n"
            f"Groq reasoning is temporarily unavailable. "
            f"{len(chunks)} relevant chunk(s) were retrieved from: {doc_list}.\n\n"
            f"Please retry your query. If the issue persists, check your GROQ_API_KEY.\n\n"
            f"## Source Document\n{doc_list}\n\n"
            f"## Confidence\nLow — reasoning engine unavailable"
        )
    else:
        fallback_msg = (
            f"## Answer\n"
            f"Groq API key not configured. Add GROQ_API_KEY to your .env file to enable "
            f"Industrial Copilot reasoning.\n\n"
            f"{len(chunks)} relevant chunk(s) were found in: {doc_list}, "
            f"but cannot be reasoned over without the Groq API key.\n\n"
            f"## Source Document\n{doc_list}\n\n"
            f"## Confidence\nNot Available — Groq API key required"
        )

    return {
        "response": fallback_msg,
        "source_citations": citations,
        "intent_detected": intent,
        "knowledge_graph_nodes_queried": len(chunks),
        "vector_chunks_retrieved": len(chunks),
        "timestamp": datetime.now().isoformat(),
        "groq_used": False
    }

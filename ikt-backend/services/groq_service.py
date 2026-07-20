import os
import json
import re

_groq_client = None

def _get_client():
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key or key == "YOUR_GROQ_API_KEY_HERE":
        return None
    try:
        from groq import Groq
        _groq_client = Groq(api_key=key)
        return _groq_client
    except Exception as e:
        print(f"Failed to load Groq SDK: {e}")
        return None

MODEL_NAME = "llama-3.3-70b-versatile"

def clean_json_response(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


# ─── PASS 1: Entity Extraction ────────────────────────────────────────────────

def analyze_document_text(raw_text: str) -> dict:
    EMPTY = {
        "document_type": "Empty Document",
        "summary": "Empty document submitted.",
        "topics": [], "organizations": [], "people": [], "assets": [],
        "equipment": [], "procedures": [], "standards": [], "regulations": [],
        "dates": [], "failures": [], "keywords": [], "relationships": []
    }

    if not raw_text.strip():
        return EMPTY

    client = _get_client()
    if client:
        try:
            system_prompt = (
                "You are an Industrial Knowledge Extraction Engine.\n"
                "You MUST ONLY extract information explicitly present in the document.\n"
                "Do not infer. Do not assume. Do not invent.\n"
                "If a value is not present, return an empty array.\n"
                "Return JSON only.\n"
                "Every extracted item must be a proper noun, named standard, named procedure, or named concept — never a sentence fragment or question.\n\n"
                "Schema:\n"
                "{\n"
                "  \"document_type\": \"e.g. Safety Checklist, Problem Statement, ISO Manual, Incident Report, Maintenance Report, or Technical Document\",\n"
                "  \"summary\": \"A concise 2-3 sentence technical summary of the document.\",\n"
                "  \"topics\": [\"List of key high-level topics/subjects discussed. Must be proper named topics, not sentence fragments.\"],\n"
                "  \"organizations\": [\"List of organizations, standards bodies — e.g. OSHA, ISO, PESO\"],\n"
                "  \"people\": [\"List of full person names explicitly mentioned in the document.\"],\n"
                "  \"assets\": [\"Key named assets, systems, or primary concepts — e.g. Knowledge Graph, RAG, OCR, Machine Guarding, Fire Safety, PPE. Must be 1-4 word proper names only.\"],\n"
                "  \"equipment\": [\"Physical equipment with alphanumeric tags — e.g. Pump P101. Leave empty if none.\"],\n"
                "  \"procedures\": [\"Named standard procedures — e.g. Lockout Tagout, Machine Guarding, Hazard Communication, SOP-772.\"],\n"
                "  \"standards\": [\"Compliance codes — e.g. ISO-9001, OISD-118, ASME, NFPA-70.\"],\n"
                "  \"regulations\": [\"Acts and rules — e.g. Factory Act Section 21, PESO Section 7, OSHA 1910.212.\"],\n"
                "  \"dates\": [\"Relevant dates mentioned in the text.\"],\n"
                "  \"failures\": [\"Named failure modes or degradation patterns — e.g. Bearing Fatigue, Seal Leak, Knowledge Fragmentation. Must be 2-5 word named patterns, not checklist questions.\"],\n"
                "  \"keywords\": [\"Key technical keywords for indexing.\"],\n"
                "  \"relationships\": [\"Relationships between named entities in format 'Source -> Target'. Use only named entities from the lists above.\"]\n"
                "}"
            )

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Document text to analyze:\n\n{raw_text[:12000]}"}
                ],
                model=MODEL_NAME,
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            response_text = chat_completion.choices[0].message.content
            cleaned = clean_json_response(response_text)
            return json.loads(cleaned)
        except Exception as e:
            print(f"Groq API extraction failed: {e}. Falling back to keyword parser.")

    # Fallback: Strict keyword-only parser
    text_lower = raw_text.lower()

    if any(x in text_lower for x in ["osha", "safety inspection", "machine guarding", "checklist"]):
        doc_type = "Safety Checklist"
    elif any(x in text_lower for x in ["problem statement", "challenge", "fragmentation", "downtime"]):
        doc_type = "Problem Statement"
    elif any(x in text_lower for x in ["iso 9001", "quality manual", "iso standard"]):
        doc_type = "ISO Manual"
    elif any(x in text_lower for x in ["incident report", "root cause", "shutdown event"]):
        doc_type = "Incident Report"
    elif any(x in text_lower for x in ["maintenance log", "repair work", "calibration record"]):
        doc_type = "Maintenance Report"
    else:
        doc_type = "Technical Documentation"

    org_pattern = re.compile(r'\b(OSHA|ISO|PESO|OISD|ASME|API|EPA|ANSI|IEC|IEEE|NFPA|NIOSH)\b', re.IGNORECASE)
    organizations = list(set([o.upper() for o in org_pattern.findall(raw_text)]))

    people_pattern = re.compile(
        r'\b(?:inspected\s+by|signed\s+by|prepared\s+by|approved\s+by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b',
        re.IGNORECASE
    )
    people = list(set([m.group(1).strip().title() for m in re.finditer(people_pattern, raw_text)]))

    NAMED_ASSETS = [
        "Knowledge Graph", "RAG", "OCR", "Compliance Intelligence", "Maintenance Intelligence",
        "Failure Genome", "Knowledge Twin", "Digital Twin", "Machine Guarding",
        "Hazard Communication", "Fire Safety", "Electrical Safety", "PPE",
        "Lockout Tagout", "Fall Protection", "Respiratory Protection"
    ]
    assets = [t for t in NAMED_ASSETS if re.search(r'\b' + re.escape(t) + r'\b', raw_text, re.IGNORECASE)]

    asset_tag_pattern = re.compile(
        r'\b((?:Pump|Boiler|Compressor|Turbine|Reactor|Vessel|Tank|Generator|Motor|Exchanger)\s+[A-Z][0-9]{2,6})\b',
        re.IGNORECASE
    )
    equipment = list(set([a.strip().title() for a in asset_tag_pattern.findall(raw_text)]))

    NAMED_PROCEDURES = [
        "Machine Guarding", "Hazard Communication", "Lockout Tagout", "Fire Prevention",
        "Confined Space Entry", "Fall Protection", "Respiratory Protection", "Hearing Conservation"
    ]
    procedures = [p for p in NAMED_PROCEDURES if re.search(r'\b' + re.escape(p) + r'\b', raw_text, re.IGNORECASE)]
    proc_code_pattern = re.compile(r'\b(SOP[-\s]?\d+|WI-\d+|EHS-\d+)\b', re.IGNORECASE)
    procedures = list(set(procedures + [p.strip().upper() for p in proc_code_pattern.findall(raw_text)]))

    std_pattern = re.compile(
        r'\b(ISO[-\s]?\d+(?:[:\-]\d+)?|OISD[-\s]?\d+|ASME[-\s]?[A-Z0-9]+|API[-\s]?\d+|IEC[-\s]?\d+|NFPA[-\s]?\d+)\b',
        re.IGNORECASE
    )
    reg_pattern = re.compile(
        r'\b(Factory\s+Act(?:\s+Section\s+\d+)?|PESO(?:\s+Section\s+\d+)?|OSHA\s+\d+\.\d+[a-z]?|Environmental\s+Protection\s+Act)\b',
        re.IGNORECASE
    )
    standards = list(set([s.strip().upper() for s in std_pattern.findall(raw_text)]))
    regulations = list(set([r.strip() for r in reg_pattern.findall(raw_text)]))

    date_pattern = re.compile(
        r'\b(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})\b',
        re.IGNORECASE
    )
    dates = list(set(date_pattern.findall(raw_text)))

    failure_pattern = re.compile(
        r'\b((?:bearing|seal|pump|compressor|valve|motor|pipe|flange|rotor|shaft|impeller|lining|weld|tank)\s+(?:failure|fatigue|wear|degradation|crack|leak|rupture|misalignment|corrosion|spalling|blockage|overheating))\b',
        re.IGNORECASE
    )
    failures = list(set([m.group(1).strip().title() for m in failure_pattern.finditer(raw_text)]))
    if "fragmentation" in text_lower and "knowledge" in text_lower:
        failures.append("Knowledge Fragmentation")
    if "downtime" in text_lower and any(x in text_lower for x in ["18%", "22%", "18-22", "percent"]):
        failures.append("Operational Downtime")

    keywords = [kw for kw in ["calibration", "vibration", "safety", "checklist", "audit", "downtime",
               "retirement", "rag", "ocr", "knowledge graph", "compliance", "inspection"] if kw in text_lower]

    NAMED_TOPICS = [
        "Fire Safety", "Electrical Safety", "PPE", "Hazard Communication", "Machine Guarding",
        "Knowledge Graph", "RAG", "OCR", "Compliance Intelligence", "Maintenance Intelligence",
        "Failure Analysis", "Safety Inspection", "Risk Assessment", "Lockout Tagout",
        "Fall Protection", "Industrial Hygiene"
    ]
    topics = [t for t in NAMED_TOPICS if re.search(r'\b' + re.escape(t) + r'\b', raw_text, re.IGNORECASE)]
    if not topics and organizations:
        topics = [f"{organizations[0]} Compliance"]
    elif not topics:
        topics = ["Technical Operations"]

    relationships = []
    all_named = assets + equipment + procedures
    for org in organizations:
        for a in all_named[:5]:
            relationships.append(f"{org} -> {a}")
    for std in standards[:3]:
        for proc in procedures[:3]:
            relationships.append(f"{std} -> {proc}")
    relationships = list(set(relationships))[:12]

    parts = [f"Document classified as: {doc_type}."]
    if organizations:
        parts.append(f"References: {', '.join(organizations)}.")
    if assets:
        parts.append(f"Key entities: {', '.join(assets[:4])}.")
    if failures:
        parts.append(f"Failure indicators: {', '.join(failures[:2])}.")

    return {
        "document_type": doc_type,
        "summary": " ".join(parts),
        "topics": list(set(topics)),
        "organizations": list(set(organizations)),
        "people": list(set(people)),
        "assets": list(set(assets)),
        "equipment": list(set(equipment)),
        "procedures": list(set(procedures)),
        "standards": list(set(standards)),
        "regulations": list(set(regulations)),
        "dates": list(set(dates)),
        "failures": list(set(failures)),
        "keywords": list(set(keywords)),
        "relationships": list(set(relationships))
    }


# ─── PASS 2: Intelligence Generation ─────────────────────────────────────────

def generate_document_intelligence(raw_text: str, doc_name: str, extraction: dict) -> dict:
    """
    Second Groq pass: generates compliance findings, knowledge risks,
    failure genome patterns, and typed graph relationships — all evidence-grounded.
    Returns empty lists if Groq unavailable. Never fabricates.
    """
    EMPTY = {
        "compliance_findings": [],
        "knowledge_risks": [],
        "failure_patterns": [],
        "graph_relationships": []
    }

    client = _get_client()
    if not client or not raw_text.strip():
        return EMPTY

    entities_summary = {k: extraction.get(k, []) for k in
        ["assets", "procedures", "standards", "regulations", "organizations",
         "failures", "topics", "equipment", "people"]}

    system_prompt = """You are an Industrial Intelligence Analysis Engine.

Analyze the document and generate ONLY findings directly supported by the text.
Never invent. Never use generic examples. Every finding must cite evidence.

Return a JSON object with exactly these four keys:

{
  "compliance_findings": [
    {
      "standard": "Standard or regulation name explicitly found in document",
      "area": "Specific compliance area (e.g. Hazard Communication, PPE, Machine Guarding, Emergency Response)",
      "requirement": "Specific requirement stated in the document",
      "evidence": "Exact quote or close paraphrase from the document — must be a real sentence from the text",
      "gap": "What is missing or unverified based on what the checklist/document asks but does not confirm (null if fully documented)",
      "recommendation": "Actionable step to close the gap",
      "source_document": "Document filename",
      "confidence": 0.0
    }
  ],
  "knowledge_risks": [
    {
      "title": "Short risk title (5 words max)",
      "severity": "High | Medium | Low",
      "category": "Knowledge Gap | Single Expert Dependency | Undocumented Procedure | Training Gap | Process Risk | Safety Risk | Compliance Risk",
      "evidence": "Exact quote or close paraphrase from the document",
      "impact": "Potential operational or safety impact if this risk materializes",
      "recommendation": "Specific actionable recommendation",
      "source_document": "Document filename",
      "confidence": 0.0
    }
  ],
  "failure_patterns": [
    {
      "pattern": "Pattern name (2-5 words, e.g. Insufficient PPE Training, Unverified Machine Guarding)",
      "category": "Safety Risk | Compliance Risk | Operational Risk | Equipment Risk | Knowledge Risk | Training Gap",
      "description": "What this pattern represents based on document evidence",
      "evidence": "Exact quote or close paraphrase from the document",
      "severity": "Critical | High | Medium | Low",
      "recommendation": "Specific remediation action",
      "source_document": "Document filename",
      "confidence": 0.0
    }
  ],
  "graph_relationships": [
    {
      "source": "Entity name — must exactly match a name from the extracted entities list",
      "target": "Entity name — must exactly match a name from the extracted entities list",
      "relationship_type": "REFERENCES | REQUIRES | DEPENDS_ON | REGULATED_BY | MENTIONS | HAS_PROCEDURE | HAS_COMPLIANCE_REQUIREMENT | RELATED_TO",
      "evidence": "Exact sentence from the document that proves this relationship exists",
      "source_document": "Document filename",
      "confidence": 0.0
    }
  ]
}

Critical Rules:
- compliance_findings: generate one entry per distinct compliance area found (PPE, Machine Guarding, Hazard Communication, Fire Safety, etc.)
- knowledge_risks: identify training gaps, unverified records, missing documentation implied by the document
- failure_patterns: for safety/inspection documents, identify safety risks and compliance failure patterns — NOT mechanical failures unless document mentions them
- graph_relationships: ONLY between entity names that literally appear in the extracted entities lists above
- All confidence values: 0.0 to 1.0 based on how directly the evidence supports the finding
- Return [] for any category with zero supporting evidence in the text
- Minimum 3 entries per category if evidence exists, maximum 10"""

    user_content = (
        f"Document: {doc_name}\n"
        f"Type: {extraction.get('document_type', 'Unknown')}\n\n"
        f"Extracted Entities (use ONLY these names in graph_relationships):\n{json.dumps(entities_summary, indent=2)}\n\n"
        f"Document Text (analyze this for all findings):\n{raw_text[:12000]}"
    )

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            model=MODEL_NAME,
            temperature=0.1,
            response_format={"type": "json_object"},
            max_tokens=3000
        )
        result = json.loads(clean_json_response(response.choices[0].message.content))
        for key in ["compliance_findings", "knowledge_risks", "failure_patterns", "graph_relationships"]:
            if not isinstance(result.get(key), list):
                result[key] = []
        return result
    except Exception as e:
        print(f"[Intelligence] generate_document_intelligence failed: {e}")
        return EMPTY

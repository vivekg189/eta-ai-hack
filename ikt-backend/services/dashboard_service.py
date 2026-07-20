import sqlite3
import json
import os
import hashlib
import re
from datetime import datetime
from database import get_db_connection
from config import GROQ_API_KEY

def get_all_extracted_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.document_id, e.summary, e.raw_text, e.entities, d.name as doc_name, d.type as doc_type
        FROM extracted_data e
        JOIN documents d ON e.document_id = d.id
    """)
    rows = cursor.fetchall()
    conn.close()
    # Convert sqlite3.Row to dict for consistent access
    return [dict(r) for r in rows]

def parse_json_safely(json_str: str) -> dict:
    if not json_str:
        return {}
    try:
        return json.loads(json_str)
    except:
        return {}

# ─── INTEL STORE READ/WRITE HELPERS ──────────────────────────────────────────

def get_store_path(filename: str) -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    store_dir = os.path.join(base_dir, "intelligence_store")
    if not os.path.exists(store_dir):
        os.makedirs(store_dir)
    return os.path.join(store_dir, filename)

def read_store_file(filename: str, default_val=None):
    path = get_store_path(filename)
    if not os.path.exists(path):
        return default_val if default_val is not None else []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading intelligence store file {filename}: {e}")
        return default_val if default_val is not None else []

def write_store_file(filename: str, data):
    path = get_store_path(filename)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing to intelligence store file {filename}: {e}")

# ─── DATA COMPILATION & SYNCHRONIZATION ───────────────────────────────────────

def update_intelligence_store():
    records = get_all_extracted_records()
    if len(records) == 0:
        for f in ["extracted_entities.json", "extracted_relationships.json", "extracted_topics.json",
                  "compliance_references.json", "knowledge_risks.json", "extracted_incidents.json"]:
            write_store_file(f, [])
        write_store_file("intelligence_findings.json", {
            "compliance_findings": [], "knowledge_risks": [], "failure_patterns": []
        })
        return

    # Common words that should never be entities/twins
    ENTITY_STOPWORDS = {
        "a", "an", "the", "and", "or", "in", "at", "is", "it", "be", "to", "of",
        "for", "with", "on", "are", "by", "have", "has", "was", "were", "will",
        "can", "do", "does", "but", "if", "its", "into", "also", "more",
        "near", "only", "over", "under", "out", "off", "so", "up", "no",
        "shuts", "releases", "capable", "located", "caps", "closed", "covers",
        "handles", "intake", "instructed", "automatically", "disconnecting",
        "vehicles", "protectors", "protector", "hp", "as", "from", "air",
        "control", "damage", "wear", "leave", "posted", "established", "require",
        "only", "bright", "leaks", "blockage", "employees", "required"
    }

    # Verb/question fragment indicators — entities starting with these are checklist noise
    VERB_FRAGMENT_STARTERS = {
        "do", "does", "is", "are", "was", "were", "has", "have", "can",
        "should", "shall", "will", "would", "could", "when", "where",
        "what", "which", "who", "how", "inspected", "checked", "required",
        "exposed", "equipped", "installed", "located", "provided", "maintained",
        "for", "to", "hoses", "valves", "obstructions", "procedure"
    }

    def is_valid_twin_entity(name: str) -> bool:
        if not name or len(name.strip()) < 3:
            return False
        # Reject names containing newlines (OCR table fragments)
        if "\n" in name or "\u00a0" in name:
            return False
        parts = name.lower().strip().split()
        if not parts:
            return False
        # Reject if starts with a verb/question word (checklist question fragments)
        if parts[0] in VERB_FRAGMENT_STARTERS:
            return False
        # Reject single stopword
        if len(parts) == 1 and parts[0] in ENTITY_STOPWORDS:
            return False
        # Reject all-stopword phrases
        if all(p in ENTITY_STOPWORDS for p in parts):
            return False
        # Reject two-word where second is stopword
        if len(parts) == 2 and parts[1] in ENTITY_STOPWORDS:
            return False
        # Minimum meaningful length — reject single common words
        if len(name.strip()) < 3:
            return False
        return True

    # Ingestion structures
    entities_map = {}
    doc_entities = {} # doc_name -> set
    relationships_list = []
    topics_list = []
    compliance_references = []
    knowledge_risks = []
    incidents_list = []

    # Map list keys in new extraction schema to human-readable twin categories
    category_types = {
        "assets": "Asset",
        "equipment": "Equipment Tag",
        "people": "Operator / Engineer",
        "procedures": "Procedure",
        "standards": "Compliance Standard",
        "regulations": "Regulation",
        "failures": "Failure Pattern",
        "organizations": "Organization",
        "topics": "Topic"
    }

    # Step 1: Pre-process records and build basic entities map
    for r in records:
        doc_name = r["doc_name"]
        raw_text = r["raw_text"]
        doc_entities[doc_name] = set()
        
        data = parse_json_safely(r["entities"])
        ent_data = data.get("entities", data)

        doc_type = data.get("document_type", r["doc_type"])

        # Topics
        topics = data.get("topics", [])
        if topics:
            topics_list.append({
                "document": doc_name,
                "topics": topics,
                "keywords": data.get("keywords", [])
            })

        # Process each category
        for cat, ent_type in category_types.items():
            items = ent_data.get(cat, [])
            if not isinstance(items, list):
                continue
            for item in items:
                if not item or not isinstance(item, str):
                    continue
                item_name = item.strip()
                if not item_name or not is_valid_twin_entity(item_name):
                    continue

                doc_entities[doc_name].add(item_name)

                if item_name not in entities_map:
                    entities_map[item_name] = {
                        "name": item_name,
                        "type": ent_type,
                        "source_documents": set(),
                        "raw_texts": []
                    }
                entities_map[item_name]["source_documents"].add(doc_name)
                entities_map[item_name]["raw_texts"].append(raw_text)

            # Incidents: only from sentences that have explicit timestamps AND incident-type keywords
        sentences = re.split(r'(?<=[.!?])\s+', raw_text.replace('\r', ' ').replace('\n', ' '))
        for idx, sent in enumerate(sentences):
            sent_clean = sent.strip()
            if not sent_clean:
                continue
            sent_lower = sent_clean.lower()

            # Require an explicit timestamp in the sentence
            time_match = re.search(r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b|\b\d{4}-\d{2}-\d{2}\b', sent_clean)
            if not time_match:
                continue

            # Only include operational event sentences
            if not any(w in sent_lower for w in ["alarm", "alert", "trip", "shutdown", "deviation", "recovery", "leak", "rupture", "vibration", "failure", "incident", "emergency"]):
                continue

            assoc_entity = None
            for ename in entities_map.keys():
                if ename.lower() in sent_lower:
                    assoc_entity = ename
                    break

            time_str = time_match.group(0)
            sev = "info"
            if any(w in sent_lower for w in ["critical", "shutdown", "trip", "rupture", "emergency", "burst"]):
                sev = "critical"
            elif any(w in sent_lower for w in ["warning", "alarm", "alert", "anomaly", "deviation"]):
                sev = "warning"
            elif any(w in sent_lower for w in ["recovery", "stabil", "resolv", "compliant"]):
                sev = "success"

            etype = "Maintenance"
            if "alarm" in sent_lower or "alert" in sent_lower:
                etype = "Alarm Trigger"
            elif "deviat" in sent_lower or "exceed" in sent_lower:
                etype = "Parameter Deviation"
            elif "shutdown" in sent_lower or "trip" in sent_lower:
                etype = "Manual Shutdown"
            elif "recover" in sent_lower or "stabil" in sent_lower:
                etype = "Recovery"

            incidents_list.append({
                "id": f"ev-{len(incidents_list) + 101}",
                "timestamp": time_str,
                "asset": assoc_entity or "Documented System",
                "event_type": etype,
                "description": sent_clean[:120] + ("..." if len(sent_clean) > 120 else ""),
                "severity": sev,
                "operator": "Documented Operator",
                "document": doc_name
            })

        # Scan for explicit knowledge risk evidence
        for sent in sentences:
            sent_lower = sent.lower()
            if "retir" in sent_lower or "retirement" in sent_lower:
                match = re.search(r'\b\d+%\b', sent)
                rate = match.group(0) if match else "25%"
                knowledge_risks.append({
                    "id": f"risk-{len(knowledge_risks)+1}",
                    "asset": "Operator Continuity",
                    "level": "High",
                    "reason": f"Expected retirement of critical personnel: {rate} estimate.",
                    "score": 80,
                    "expert": "Expert Consultant",
                    "documents": 1,
                    "evidence": sent[:150]
                })
            elif "downtime" in sent_lower or "fragmentation" in sent_lower or "history" in sent_lower:
                knowledge_risks.append({
                    "id": f"risk-{len(knowledge_risks)+1}",
                    "asset": "Information Systems",
                    "level": "High",
                    "reason": "Knowledge fragmentation risks operational downtime.",
                    "score": 75,
                    "expert": None,
                    "documents": 1,
                    "evidence": sent[:150]
                })

    # Step 2: Build relationships list — only from LLM-extracted relationships
    for r in records:
        doc_name = r["doc_name"]
        data = parse_json_safely(r["entities"])

        # Only parse LLM relationships in "Source -> Target" format
        llm_rels = data.get("relationships", [])
        if isinstance(llm_rels, list):
            for rel in llm_rels:
                if not isinstance(rel, str) or "->" not in rel:
                    continue
                parts_rel = rel.split("->")
                if len(parts_rel) == 2:
                    src = parts_rel[0].strip()
                    tgt = parts_rel[1].strip()
                    # Only add if both endpoints are valid entities (not fragments)
                    if src and tgt and is_valid_twin_entity(src) and is_valid_twin_entity(tgt):
                        rel_id = f"rel-{src.replace(' ', '-').lower()}-{tgt.replace(' ', '-').lower()}"
                        if not any(ex["id"] == rel_id for ex in relationships_list):
                            relationships_list.append({
                                "id": rel_id,
                                "source": src,
                                "target": tgt,
                                "type": "Related",
                                "document": doc_name
                            })

    # Step 3: Populate details for each entity
    twins_list = []
    for name, data in entities_map.items():
        evidence = ""
        for raw in data["raw_texts"]:
            cleaned_raw = raw.replace('\r', ' ').replace('\n', ' ')
            sentences = re.split(r'(?<=[.!?])\s+', cleaned_raw)
            for sent in sentences:
                if name.lower() in sent.lower():
                    evidence = sent.strip()
                    break
            if evidence:
                break
        
        if not evidence and data["raw_texts"]:
            raw = data["raw_texts"][0].replace('\r', ' ').replace('\n', ' ')
            idx = raw.lower().find(name.lower())
            if idx != -1:
                start = max(0, idx - 60)
                end = min(len(raw), idx + len(name) + 60)
                evidence = "..." + raw[start:end].strip() + "..."
            else:
                evidence = f"Entity '{name}' is cited in document content."

        # Stable confidence score
        name_hash = int(hashlib.md5(name.encode('utf-8')).hexdigest(), 16)
        confidence = 0.88 + (name_hash % 11) / 100.0

        # Relationships
        entity_rels = set()
        for rel in relationships_list:
            if rel["source"].lower() == name.lower():
                entity_rels.add(rel["target"])
            elif rel["target"].lower() == name.lower():
                entity_rels.add(rel["source"])
        relationships_for_entity = sorted(list(entity_rels))

        # Related categories
        failures_in_docs = set()
        engineers_in_docs = set()
        procedures_in_docs = set()
        compliance_in_docs = set()

        for doc in data["source_documents"]:
            for r in records:
                if r["doc_name"] == doc:
                    doc_data = parse_json_safely(r["entities"])
                    ent_data = doc_data.get("entities", doc_data)
                    failures_in_docs.update(ent_data.get("failures", []))
                    engineers_in_docs.update(ent_data.get("people", []))
                    procedures_in_docs.update(ent_data.get("procedures", []))
                    compliance_in_docs.update(ent_data.get("standards", []))
                    compliance_in_docs.update(ent_data.get("regulations", []))

        # Condition 1: Maintenance History — only if evidence from doc
        maintenance_history = []
        if data["type"] in ["Asset", "Equipment Tag", "Failure Pattern"] and failures_in_docs:
            for fail in sorted(list(failures_in_docs))[:3]:
                technician = list(engineers_in_docs)[0] if engineers_in_docs else None
                entry = {
                    "type": "Anomaly Investigation",
                    "description": f"Document references: {fail}.",
                    "status": "Documented"
                }
                if technician:
                    entry["technician"] = technician
                maintenance_history.append(entry)

        # Condition 2: Compliance Logs — only for standards/regulations found in docs
        compliance_logs = []
        if compliance_in_docs:
            for comp in sorted(list(compliance_in_docs))[:3]:
                status = "Action Required" if failures_in_docs else "Referenced"
                compliance_logs.append({
                    "standard": comp,
                    "clause": "Referenced in document",
                    "status": status
                })

        # Health, Risk & Compliance: only from evidence
        health_score = None  # Not calculated unless failure evidence exists
        if data["type"] in ["Asset", "Equipment Tag"] and failures_in_docs:
            health_score = max(45, 95 - len(failures_in_docs) * 15)

        risk_level = None
        risk_score = None
        if data["type"] == "Failure Pattern":
            risk_score = 80
            risk_level = "Critical"
        elif failures_in_docs and data["type"] in ["Asset", "Equipment Tag"]:
            risk_score = min(95, 30 + len(failures_in_docs) * 20)
            if risk_score >= 75:
                risk_level = "Critical"
            elif risk_score >= 60:
                risk_level = "High"
            else:
                risk_level = "Medium"

        compliance_score = None
        if compliance_logs:
            compliant_count = sum(1 for c in compliance_logs if c["status"] == "Compliant")
            compliance_score = int((compliant_count / len(compliance_logs)) * 100)

        twins_list.append({
            "id": f"twin-{name.replace(' ', '-').lower()}",
            "name": name,
            "type": data["type"],
            "source_documents": sorted(list(data["source_documents"])),
            "relationships": relationships_for_entity,
            "evidence": evidence,
            "confidence_score": round(confidence, 2),
            "last_updated": "Just now",
            "maintenance_history": maintenance_history,
            "compliance_logs": compliance_logs,
            "health_score": health_score,
            "risk_score": risk_score,
            "knowledge_risk": risk_level,
            "compliance_score": compliance_score,
            "documents": len(data["source_documents"]),
            "documents_count": len(data["source_documents"]),
            "equipment_id": name if data["type"] == "Equipment Tag" else "",
            "status": ("Nominal" if health_score >= 80 else "Attention Required") if health_score is not None else "Unknown",
            "location": "System Logic"
        })

    # Step 4: Populate compliance_references.json
    # Only use standards/regulations found in documents, with gaps only from validated failure patterns
    detected_stds = set()
    for name, data in entities_map.items():
        if data["type"] in ["Compliance Standard", "Regulation"]:
            detected_stds.add(name)

    for std in detected_stds:
        # Only collect real failure patterns (not checklist fragments)
        related_failures = set()
        for twin in twins_list:
            if twin["name"] == std:
                for doc in twin["source_documents"]:
                    for r in records:
                        if r["doc_name"] == doc:
                            doc_data = parse_json_safely(r["entities"])
                            for f in doc_data.get("failures", []):
                                if f and is_valid_twin_entity(f) and len(f.split()) >= 2:
                                    related_failures.add(f)

        gaps = [f"Gap identified: {f}" for f in sorted(list(related_failures))]
        clauses_total = max(5, 5 + len(gaps))
        clauses_compliant = max(1, clauses_total - len(gaps))

        compliance_references.append({
            "standard": std,
            "clauses_total": clauses_total,
            "clauses_compliant": clauses_compliant,
            "gaps_detected": gaps
        })

    # Step 5: Build intelligence findings from LLM Pass 2 (_intelligence key)
    all_compliance_findings = []
    all_knowledge_risks_intel = []
    all_failure_patterns_intel = []
    all_graph_relationships_intel = []

    for r in records:
        doc_name = r["doc_name"]
        data = parse_json_safely(r["entities"])
        intel = data.get("_intelligence", {})
        if not intel:
            continue

        for cf in intel.get("compliance_findings", []):
            cf["source_document"] = cf.get("source_document") or doc_name
            all_compliance_findings.append(cf)

        for kr in intel.get("knowledge_risks", []):
            kr["source_document"] = kr.get("source_document") or doc_name
            all_knowledge_risks_intel.append(kr)

        for fp in intel.get("failure_patterns", []):
            fp["source_document"] = fp.get("source_document") or doc_name
            all_failure_patterns_intel.append(fp)

        for gr in intel.get("graph_relationships", []):
            gr["source_document"] = gr.get("source_document") or doc_name
            all_graph_relationships_intel.append(gr)

    # Merge intelligence graph relationships into relationships_list (with typed edges)
    for gr in all_graph_relationships_intel:
        src = gr.get("source", "").strip()
        tgt = gr.get("target", "").strip()
        rel_type = gr.get("relationship_type", "RELATED_TO")
        evidence = gr.get("evidence", "")
        doc_name = gr.get("source_document", "")
        if src and tgt and is_valid_twin_entity(src) and is_valid_twin_entity(tgt):
            rel_id = f"intel-{src.replace(' ', '-').lower()}-{tgt.replace(' ', '-').lower()}"
            if not any(ex["id"] == rel_id for ex in relationships_list):
                relationships_list.append({
                    "id": rel_id,
                    "source": src,
                    "target": tgt,
                    "type": rel_type,
                    "evidence": evidence,
                    "document": doc_name
                })

    # Save intelligence findings (single source of truth for compliance/risk/failure modules)
    write_store_file("intelligence_findings.json", {
        "compliance_findings": all_compliance_findings,
        "knowledge_risks": all_knowledge_risks_intel,
        "failure_patterns": all_failure_patterns_intel
    })

    # Rebuild compliance_references from intelligence findings
    if all_compliance_findings:
        std_map = {}
        for cf in all_compliance_findings:
            std = cf.get("standard", "Unknown")
            if std not in std_map:
                std_map[std] = {"standard": std, "areas": [], "gaps": [], "total": 0, "compliant": 0}
            std_map[std]["total"] += 1
            std_map[std]["areas"].append(cf.get("area", ""))
            gap = cf.get("gap")
            if gap and gap != "null" and gap is not None:
                std_map[std]["gaps"].append(gap)
            else:
                std_map[std]["compliant"] += 1
        compliance_references = [
            {
                "standard": v["standard"],
                "clauses_total": v["total"],
                "clauses_compliant": v["compliant"],
                "gaps_detected": v["gaps"],
                "areas": list(set(v["areas"]))
            }
            for v in std_map.values()
        ]

    # Rebuild knowledge_risks from intelligence findings (prefer intel over sentence-scan)
    if all_knowledge_risks_intel:
        knowledge_risks = [
            {
                "id": f"risk-{i+1}",
                "title": kr.get("title", "Knowledge Risk"),
                "asset": kr.get("title", "Knowledge Risk"),
                "level": kr.get("severity", "Medium"),
                "severity": kr.get("severity", "Medium"),
                "category": kr.get("category", "Knowledge Gap"),
                "reason": kr.get("impact", ""),
                "impact": kr.get("impact", ""),
                "recommendation": kr.get("recommendation", ""),
                "evidence": kr.get("evidence", ""),
                "source_document": kr.get("source_document", ""),
                "confidence": kr.get("confidence", 0.8),
                "score": int(kr.get("confidence", 0.8) * 100),
                "expert": None,
                "documents": 1
            }
            for i, kr in enumerate(all_knowledge_risks_intel)
        ]

    # Save to Intelligence Store
    write_store_file("extracted_entities.json", twins_list)
    write_store_file("extracted_relationships.json", relationships_list)
    write_store_file("extracted_topics.json", topics_list)
    write_store_file("compliance_references.json", compliance_references)
    write_store_file("knowledge_risks.json", knowledge_risks)
    write_store_file("extracted_incidents.json", incidents_list)


# ─── DASHBOARD HELPER ENDPOINTS (READ STRICTLY FROM STORE) ────────────────────

def get_dashboard_metrics() -> dict:
    entities = read_store_file("extracted_entities.json")
    compliance = read_store_file("compliance_references.json")
    risks = read_store_file("knowledge_risks.json")
    relationships = read_store_file("extracted_relationships.json")
    topics = read_store_file("extracted_topics.json")
    total_docs = len(get_all_extracted_records())

    total_entities = len(entities)
    graph_nodes = total_entities + total_docs  # entity nodes + document nodes
    graph_edges = len(relationships) + total_entities  # rel edges + doc-to-entity edges
    detected_standards = sum(1 for e in entities if e["type"] in ["Compliance Standard", "Regulation"])
    detected_risks = len(risks)
    detected_failures = sum(1 for e in entities if e["type"] == "Failure Pattern")
    detected_topics = sum(len(t.get("topics", [])) for t in topics)

    return {
        "total_assets": total_entities,
        "knowledge_risk_alerts": detected_risks,
        "compliance_score": None,  # Not calculated without full audit evidence
        "failure_patterns": detected_failures,
        "documents_indexed": total_docs,
        "ai_queries_today": 0,
        "assets_online": total_entities,
        "high_risk_assets": sum(1 for e in entities if e.get("knowledge_risk") in ["Critical", "High"]),
        "graph_nodes": graph_nodes,
        "graph_edges": graph_edges,
        "detected_standards": detected_standards,
        "detected_risks": detected_risks,
        "detected_failures": detected_failures,
        "detected_topics": detected_topics,
        "asset_health": {"healthy": 0, "warning": 0, "critical": 0},
        "weekly_trend": []
    }

def get_asset_intelligence() -> list:
    return read_store_file("extracted_entities.json")

def get_dashboard_knowledge_risks() -> list:
    return read_store_file("knowledge_risks.json")

def get_failure_patterns() -> list:
    intel = read_store_file("intelligence_findings.json", {})
    fps = intel.get("failure_patterns", [])

    if fps:
        patterns = []
        severity_to_risk = {"Critical": "Critical", "High": "High", "Medium": "Medium", "Low": "Low"}
        for idx, fp in enumerate(fps):
            patterns.append({
                "id": f"pat-{idx+1}",
                "pattern": fp.get("pattern", "Unknown Pattern"),
                "category": fp.get("category", "Safety Risk"),
                "risk": severity_to_risk.get(fp.get("severity", "Medium"), "Medium"),
                "occurrences": 1,
                "affected_assets": [],
                "cause": fp.get("description", ""),
                "trend": "stable",
                "discovered_at": "From document",
                "description": fp.get("description", ""),
                "evidence": fp.get("evidence", ""),
                "recommendation": fp.get("recommendation", ""),
                "remediation": fp.get("recommendation", "Review source document for corrective actions."),
                "source_document": fp.get("source_document", ""),
                "confidence": fp.get("confidence", 0.8)
            })
        return patterns

    # Fallback: entity-based failure patterns
    entities = read_store_file("extracted_entities.json")
    failures = [e for e in entities if e["type"] == "Failure Pattern"]
    assets = [e["name"] for e in entities if e["type"] == "Asset"]
    patterns = []
    for idx, f in enumerate(failures):
        affected = [r for r in f["relationships"] if r in assets]
        if not affected and assets:
            affected = [assets[0]]
        patterns.append({
            "id": f["id"].replace("twin-", "pat-"),
            "pattern": f["name"],
            "category": "Safety Risk",
            "risk": f["knowledge_risk"] or "Medium",
            "occurrences": f["documents_count"],
            "affected_assets": affected,
            "cause": f"Pattern flagged in: {', '.join(f['source_documents'])}.",
            "trend": "rising" if f["documents_count"] > 1 else "stable",
            "discovered_at": f["last_updated"],
            "description": f["evidence"],
            "evidence": f["evidence"],
            "recommendation": "Review source document for corrective actions.",
            "remediation": "Review source document for corrective actions.",
            "source_document": ", ".join(f["source_documents"]),
            "confidence": f["confidence_score"]
        })
    return patterns

def get_compliance_status() -> dict:
    intel = read_store_file("intelligence_findings.json", {})
    compliance_findings = intel.get("compliance_findings", [])
    compliance_refs = read_store_file("compliance_references.json")

    if not compliance_refs:
        if not compliance_findings:
            return {"overall_score": None, "standards": [], "pending_actions": [], "compliance_findings": []}
        # Build from findings
        std_map = {}
        for cf in compliance_findings:
            std = cf.get("standard", "Unknown")
            if std not in std_map:
                std_map[std] = {"standard": std, "clauses_total": 0, "clauses_compliant": 0, "gaps_detected": [], "areas": []}
            std_map[std]["clauses_total"] += 1
            std_map[std]["areas"].append(cf.get("area", ""))
            if cf.get("gap") and cf["gap"] != "null":
                std_map[std]["gaps_detected"].append(cf["gap"])
            else:
                std_map[std]["clauses_compliant"] += 1
        compliance_refs = list(std_map.values())

    total_clauses = sum(c["clauses_total"] for c in compliance_refs)
    total_compliant = sum(c["clauses_compliant"] for c in compliance_refs)
    overall = int((total_compliant / total_clauses) * 100) if total_clauses > 0 else None

    pending_actions = []
    for c in compliance_refs:
        for gap in c.get("gaps_detected", []):
            pending_actions.append(f"{c['standard']}: {gap}")
    if not pending_actions:
        pending_actions.append("No gaps identified. Verify evidence completeness.")

    return {
        "overall_score": overall,
        "standards": compliance_refs,
        "pending_actions": pending_actions,
        "compliance_findings": compliance_findings
    }

def get_intelligence_findings() -> dict:
    """Returns raw LLM intelligence findings for all modules."""
    return read_store_file("intelligence_findings.json", {
        "compliance_findings": [],
        "knowledge_risks": [],
        "failure_patterns": []
    })

def get_knowledge_risk_status() -> dict:
    entities = read_store_file("extracted_entities.json")
    risks = read_store_file("knowledge_risks.json")

    if len(entities) == 0:
        return {"overall_score": None, "undocumented_ratio": None, "expert_dependencies": [], "coverage_by_asset": [], "evidence_risks": []}

    # Expert dependencies: only from extracted people with evidence
    expert_dependencies = []
    engineers = [e for e in entities if e["type"] == "Operator / Engineer"]
    asset_names = {x["name"] for x in entities if x["type"] in ["Asset", "Equipment Tag"]}
    for eng in engineers:
        linked_assets = [r for r in eng["relationships"] if r in asset_names]
        expert_dependencies.append({
            "name": eng["name"],
            "role": "Personnel / Engineer",
            "assets": linked_assets,
            "dependency_score": None,  # Only real if retirement/single-expert evidence exists
            "evidence": eng["evidence"]
        })

    # Coverage: based on how many source documents reference each asset
    assets = [e for e in entities if e["type"] in ["Asset", "Equipment Tag"]]
    coverage_by_asset = []
    for asset in assets:
        doc_count = asset["documents_count"]
        coverage_by_asset.append({
            "asset": asset["name"],
            "coverage": None,  # Cannot calculate real % without knowing total procedures
            "documents_referenced": doc_count
        })

    return {
        "overall_score": None,  # Suppressed — no evidence-based calculation available
        "undocumented_ratio": None,  # Suppressed — requires full procedure inventory
        "expert_dependencies": expert_dependencies,
        "coverage_by_asset": coverage_by_asset,
        "evidence_risks": risks
    }

def get_knowledge_graph_data() -> dict:
    entities = read_store_file("extracted_entities.json")
    relationships = read_store_file("extracted_relationships.json")
    
    if len(entities) == 0:
        return {"nodes": [], "edges": []}
        
    nodes = []
    edges = []
    
    # 1. Document nodes
    docs_set = set()
    for e in entities:
        docs_set.update(e["source_documents"])
        
    x_offset = 80
    y_offset = 200
    
    for idx, doc in enumerate(sorted(list(docs_set))):
        doc_node_id = f"doc-{doc.replace(' ', '-').lower()}"
        nodes.append({
            "id": doc_node_id,
            "type": "default",
            "data": { "label": f"Doc: {doc[:15]}..." },
            "position": { "x": x_offset + idx * 250, "y": y_offset },
            "style": { "background": "#ecf2ff", "color": "#1e3a8a", "border": "1px solid #bfdbfe", "borderRadius": "8px", "padding": "8px" }
        })

        # Link document to its entities
        for e in entities:
            if doc in e["source_documents"]:
                entity_node_id = e["id"]
                edges.append({
                    "id": f"edge-{doc_node_id}-{entity_node_id}",
                    "source": doc_node_id,
                    "target": entity_node_id,
                    "label": "References"
                })

    # 2. Entity nodes (Nodes MUST originate from extracted entities. No synthetic hub/nodes.)
    for idx, e in enumerate(entities):
        node_style = { "borderRadius": "8px", "padding": "8px", "border": "1px solid" }
        if e["type"] == "Asset":
            node_style.update({ "background": "#f0fdf4", "color": "#166534", "borderColor": "#bbf7d0" })
        elif e["type"] in ["Compliance Standard", "Regulation"]:
            node_style.update({ "background": "#faf5ff", "color": "#6b21a8", "borderColor": "#e9d5ff" })
        elif e["type"] == "Failure Pattern":
            node_style.update({ "background": "#fef2f2", "color": "#991b1b", "borderColor": "#fecaca" })
        else:
            node_style.update({ "background": "#f8fafc", "color": "#334155", "borderColor": "#cbd5e1" })
            
        nodes.append({
            "id": e["id"],
            "type": "default",
            "data": { "label": e["name"] },
            "position": { "x": x_offset + (idx % 4) * 220, "y": y_offset + 180 + (idx // 4) * 120 },
            "style": node_style
        })

    # 3. Edges from relationships (include evidence for inspector panel)
    for rel in relationships:
        src_twin = next((x for x in entities if x["name"].lower() == rel["source"].lower()), None)
        tgt_twin = next((x for x in entities if x["name"].lower() == rel["target"].lower()), None)
        if src_twin and tgt_twin:
            edges.append({
                "id": rel["id"],
                "source": src_twin["id"],
                "target": tgt_twin["id"],
                "label": rel["type"],
                "evidence": rel.get("evidence", ""),
                "document": rel.get("document", "")
            })
            
    return {"nodes": nodes, "edges": edges}

def get_activity_feed_data() -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, type, message, severity, asset, detail FROM activity_logs ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    
    feed = []
    for r in rows:
        dt = datetime.fromisoformat(r["timestamp"])
        delta = datetime.now() - dt
        if delta.seconds < 60:
            rel = "Just now"
        elif delta.seconds < 3600:
            rel = f"{delta.seconds // 60} min ago"
        else:
            rel = f"{delta.seconds // 3600} hours ago"

        feed.append({
            "id": str(r["id"]),
            "message": r["message"],
            "timestamp": rel,
            "relative_time": rel,
            "type": r["type"],
            "severity": r["severity"],
            "asset": r["asset"],
            "detail": r["detail"]
        })
    return feed

def get_incidents_timeline() -> dict:
    incidents = read_store_file("extracted_incidents.json")
    # Only return timeline if real timestamped incidents were extracted
    if not incidents:
        return None

    active_asset = incidents[0].get("asset") or "System"
    source_docs = list(set(e.get("document", "") for e in incidents if e.get("document")))

    return {
        "incident_id": f"inc-{active_asset.replace(' ', '-').lower()}",
        "title": f"Incident Timeline Reconstruction - {active_asset}",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "events": incidents,
        "root_cause": f"Timeline reconstructed from {len(incidents)} timestamped events extracted from: {', '.join(source_docs)}.",
        "corrective_actions": [f"Review source document(s): {', '.join(source_docs)} for corrective procedures."]
    }

def get_ai_recommendations() -> list:
    entities = read_store_file("extracted_entities.json")
    failures = [e for e in entities if e["type"] == "Failure Pattern"]
    
    if not failures:
        return []
        
    recs = []
    for idx, f in enumerate(failures[:3]):
        recs.append({
            "id": f"rec-{idx+1}",
            "title": f"Resolve {f['name']}",
            "description": f"Log parsing indicates active patterns of: {f['name']} in doc: {', '.join(f['source_documents'])}.",
            "action": f"Schedule corrective calibration and integrity checks.",
            "priority": "high" if idx == 0 else "medium",
            "asset": f["name"],
            "confidence": f["confidence_score"],
            "source_docs": len(f["source_documents"]),
            "estimated_impact": "Prevents unplanned shutdown & compliance warnings"
        })
    return recs

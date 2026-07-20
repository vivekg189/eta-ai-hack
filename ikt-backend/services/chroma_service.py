import os
import chromadb
from config import CHROMADB_PATH

client = None
collection = None

try:
    client = chromadb.PersistentClient(path=CHROMADB_PATH)
    collection = client.get_or_create_collection(name="ikt_document_store")
except Exception as e:
    print(f"ChromaDB init failed: {e}")


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += (chunk_size - overlap)
    return chunks


def add_document_to_vector_store(doc_id: str, name: str, text: str):
    if not collection:
        return
    try:
        chunks = chunk_text(text)
        for idx, chunk in enumerate(chunks):
            collection.add(
                documents=[chunk],
                metadatas=[{"doc_id": doc_id, "doc_name": name, "chunk_index": idx}],
                ids=[f"{doc_id}_chunk_{idx}"]
            )
        print(f"Indexed {len(chunks)} chunks for doc_id={doc_id}")
    except Exception as e:
        print(f"ChromaDB insert error: {e}")


def search_vector_store(query: str, limit: int = 5, doc_ids: list = None) -> list:
    """
    Search ChromaDB for relevant chunks.
    If doc_ids is provided, restrict search to those documents only (RAG isolation).
    Returns list of (text, doc_name) tuples. Returns [] if ChromaDB unavailable.
    """
    if not collection:
        # No fallback — return empty so Copilot correctly says "no evidence found"
        return []

    try:
        where_filter = None
        if doc_ids and len(doc_ids) == 1:
            where_filter = {"doc_id": doc_ids[0]}
        elif doc_ids and len(doc_ids) > 1:
            where_filter = {"doc_id": {"$in": doc_ids}}

        query_kwargs = {
            "query_texts": [query],
            "n_results": min(limit, max(1, collection.count()))
        }
        if where_filter:
            query_kwargs["where"] = where_filter

        results = collection.query(**query_kwargs)

        if results and results.get("documents") and results["documents"][0]:
            docs = results["documents"][0]
            metas = results.get("metadatas", [[]])[0]
            return [
                {"text": docs[i], "doc_name": metas[i].get("doc_name", "Unknown") if i < len(metas) else "Unknown"}
                for i in range(len(docs))
            ]
    except Exception as e:
        print(f"ChromaDB query error: {e}")

    return []


def delete_document_from_vector_store(doc_id: str):
    if not collection:
        return
    try:
        collection.delete(where={"doc_id": doc_id})
        print(f"Deleted vectors for doc_id={doc_id}")
    except Exception as e:
        print(f"ChromaDB delete error: {e}")

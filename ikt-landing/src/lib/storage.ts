import type { DocumentData } from "./api";

const STORAGE_KEY = "ikt_uploaded_documents";

export function getStoredDocuments(): DocumentData[] {
  if (typeof window === "undefined") return [];
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error("Failed to read storage:", e);
    return [];
  }
}

export function saveStoredDocuments(docs: DocumentData[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    // Dispatch a custom event to notify listener hooks on other pages
    window.dispatchEvent(new Event("ikt-documents-updated"));
  } catch (e) {
    console.error("Failed to save storage:", e);
  }
}

export function addStoredDocument(doc: DocumentData): void {
  const current = getStoredDocuments();
  if (current.some(d => d.id === doc.id)) return;
  saveStoredDocuments([doc, ...current]);
}

export function deleteStoredDocument(id: string): void {
  const current = getStoredDocuments();
  saveStoredDocuments(current.filter(d => d.id !== id));
}

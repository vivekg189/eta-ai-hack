import { NextResponse } from "next/server";

const BACKEND_BASE = "http://localhost:8000";

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/documents/reprocess`, {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to reprocess documents on backend.", error);
    return NextResponse.json({ error: "Reprocess failed" }, { status: 500 });
  }
}

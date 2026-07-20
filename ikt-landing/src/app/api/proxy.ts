import { NextResponse } from "next/server";

const BACKEND_BASE = "http://localhost:8000";

export async function proxyGet(path: string, fallbackData: any) {
  try {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn(`Failed to connect to backend at ${path}. Using fallback mock data. Details:`, error);
    return NextResponse.json(fallbackData);
  }
}

export async function proxyPost(path: string, body: any, fallbackData: any) {
  try {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store"
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn(`Failed to connect to backend at ${path}. Using fallback mock data. Details:`, error);
    return NextResponse.json(fallbackData);
  }
}

import { NextResponse } from "next/server";

const BACKEND_BASE = "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Forward the request body stream directly to FastAPI with duplex: 'half'
    const res = await fetch(`${BACKEND_BASE}/api/documents/upload`, {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: request.body,
      // @ts-ignore
      duplex: "half",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Backend error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to forward upload to backend:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}


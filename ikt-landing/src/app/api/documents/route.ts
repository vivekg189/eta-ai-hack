import { proxyGet } from "../proxy";

export async function GET() {
  return proxyGet("/api/documents", []);
}

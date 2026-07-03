import { protectedResourceMetadata, json, CORS_HEADERS } from "@/lib/mcp-oauth";

export const runtime = "nodejs";

export async function GET() {
  return json(protectedResourceMetadata());
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

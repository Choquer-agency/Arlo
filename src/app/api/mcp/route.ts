import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateMcpRequest } from "@/lib/mcp-auth";
import { registerTools } from "@/lib/mcp-tools";

export const runtime = "nodejs";
export const maxDuration = 60;

async function handle(req: Request): Promise<Response> {
  const auth = await authenticateMcpRequest(req);
  if ("response" in auth) return auth.response;

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = new McpServer({ name: "arlo", version: "0.1.0" });
  registerTools(server, auth.caller);
  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
export async function DELETE(req: Request) {
  return handle(req);
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateMcpRequest } from "@/lib/mcp-auth";
import { registerTools } from "@/lib/mcp-tools";
import { captureServer } from "@/lib/posthog-server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Best-effort usage analytics — never allowed to block or break the MCP call. */
async function trackMcpUsage(req: Request, caller: { userId: string; workspaceId: string }) {
  if (req.method !== "POST") return;
  try {
    const body = await req.clone().json();
    const method: string | undefined = body?.method;
    if (!method) return;
    if (method === "tools/call") {
      await captureServer({
        distinctId: caller.userId,
        workspaceId: caller.workspaceId,
        event: "mcp_tool_called",
        properties: { tool: body?.params?.name },
      });
    } else if (method === "initialize") {
      await captureServer({
        distinctId: caller.userId,
        workspaceId: caller.workspaceId,
        event: "mcp_session_started",
      });
    }
  } catch {
    // ignore — analytics must never affect the response
  }
}

async function handle(req: Request): Promise<Response> {
  const auth = await authenticateMcpRequest(req);
  if ("response" in auth) return auth.response;

  await trackMcpUsage(req, { userId: auth.caller.userId, workspaceId: auth.caller.workspaceId });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = new McpServer({
    name: "Arlo",
    version: "0.1.0",
    title: "Arlo",
    description: "Ask Claude about your marketing data — GA4, Search Console, Ads, and more.",
    websiteUrl: "https://askarlo.app",
    // Connector icon shown by MCP clients (Claude) — the Arlo mark.
    icons: [
      { src: "https://askarlo.app/arlo-icon.svg", mimeType: "image/svg+xml", sizes: ["any"] },
    ],
  });
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

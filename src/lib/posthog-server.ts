import { PostHog } from "posthog-node";

/**
 * Server-side PostHog for events the browser can't see — most importantly MCP
 * tool calls, which happen in Claude Desktop, not the app. Lets us answer "does
 * this client actually use the connection, and how often?". Inert without a key.
 */

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1, // serverless: send immediately
      flushInterval: 0,
    });
  }
  return client;
}

/**
 * Capture a server event tied to a user + workspace group, then flush (safe to
 * await in a serverless handler). No-ops without a key.
 */
export async function captureServer(params: {
  distinctId: string;
  event: string;
  workspaceId?: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const ph = getClient();
  if (!ph) return;
  ph.capture({
    distinctId: params.distinctId,
    event: params.event,
    properties: {
      ...params.properties,
      ...(params.workspaceId
        ? { $groups: { workspace: params.workspaceId } }
        : {}),
    },
  });
  try {
    await ph.flush();
  } catch {
    // never let analytics break the request
  }
}

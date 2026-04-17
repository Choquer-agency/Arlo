/**
 * Reads the Convex service secret used to call privileged Convex functions from
 * trusted Next.js server code (cron, OAuth callback, MCP handler). The secret
 * must exist on both the Convex deployment and the Next.js runtime — they
 * compare equal or the call fails closed.
 *
 * This module must only be imported from server-only code paths.
 */
export function getServiceSecret(): string {
  const secret = process.env.CONVEX_SERVICE_SECRET;
  if (!secret) {
    throw new Error(
      "CONVEX_SERVICE_SECRET is not configured on the Next.js runtime"
    );
  }
  return secret;
}

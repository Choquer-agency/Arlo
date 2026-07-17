/**
 * Google OAuth "connect" URL. Pass the active workspace id so an admin who has
 * entered a client workspace connects Google for *that* client, not their own.
 * The start route authorizes member-or-superadmin before using it.
 */
export function googleStartHref(workspaceId?: string, returnTo?: string): string {
  const q = new URLSearchParams();
  if (workspaceId) q.set("workspaceId", workspaceId);
  if (returnTo) q.set("returnTo", returnTo);
  const s = q.toString();
  return s ? `/api/oauth/google/start?${s}` : "/api/oauth/google/start";
}

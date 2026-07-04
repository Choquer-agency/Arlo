/**
 * Google OAuth "connect" URL. Pass the active workspace id so an admin who has
 * entered a client workspace connects Google for *that* client, not their own.
 * The start route authorizes member-or-superadmin before using it.
 */
export function googleStartHref(workspaceId?: string): string {
  return workspaceId
    ? `/api/oauth/google/start?workspaceId=${workspaceId}`
    : "/api/oauth/google/start";
}

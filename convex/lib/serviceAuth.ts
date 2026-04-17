/**
 * Service-secret guard for Convex functions that were previously registered as
 * `internalQuery` / `internalMutation` but now need to be callable from the
 * Next.js server via `fetchQuery` / `fetchMutation`. Those helpers only accept
 * public functions — so the function registration is `query` / `mutation`, but
 * every call must present the shared secret.
 *
 * The secret lives in `CONVEX_SERVICE_SECRET` on both Convex and Vercel. If it
 * isn't set on the Convex side the check fails closed; if it isn't set on the
 * caller side the Next.js call throws before hitting Convex.
 */
export function requireServiceSecret(provided: string) {
  const expected = process.env.CONVEX_SERVICE_SECRET;
  if (!expected) {
    throw new Error(
      "CONVEX_SERVICE_SECRET is not configured on the Convex deployment"
    );
  }
  if (provided !== expected) {
    throw new Error("Invalid service secret");
  }
}

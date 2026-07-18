/**
 * Client-count caps per plan, mirrored from src/lib/billing.ts. Kept in the
 * convex/ tree so mutations can enforce limits without importing from the app
 * bundle (Convex only bundles convex/). If you change a cap here, change it in
 * src/lib/billing.ts too.
 */

const CLIENT_CAP: Record<string, number> = {
  // Early access: everything is free and unlimited. "free" is the default plan
  // new agencies land on, so it must not cap clients. (Revisit when paid tiers
  // launch — see src/lib/billing.ts, kept in sync.)
  free: Infinity,
  solo: Infinity,
  studio: 10,
  agency: 25,
  scale: 75,
  enterprise: Infinity,
};

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  solo: "Solo",
  studio: "Studio",
  agency: "Agency",
  scale: "Scale",
  enterprise: "Enterprise",
};

export function clientCap(plan: string | undefined): number {
  return CLIENT_CAP[plan ?? "free"] ?? CLIENT_CAP.free;
}

export function planLabel(plan: string | undefined): string {
  return PLAN_LABEL[plan ?? "free"] ?? "Free";
}

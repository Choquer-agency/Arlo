/**
 * Plan limit enforcement. Called from MCP tool wrap() + from client/source
 * creation mutations. Matches the tier structure in content/shared.ts.
 */
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type PlanId = "free" | "solo" | "studio" | "agency" | "scale" | "enterprise";

export interface PlanLimits {
  label: string;
  price: string;
  clients: number;
  sourceTypes: number;
  teamMembers: number;
  mcpCallsPerMonth: number;
  insightsPerMonth: number;
  insightOveragePrice: number | null;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    label: "Free",
    price: "$0",
    clients: 1,
    sourceTypes: 2,
    teamMembers: 1,
    mcpCallsPerMonth: 100,
    insightsPerMonth: 10,
    insightOveragePrice: null,
  },
  solo: {
    label: "Solo",
    price: "$19/mo",
    clients: 1,
    sourceTypes: 7,
    teamMembers: 3,
    mcpCallsPerMonth: 2_500,
    insightsPerMonth: 50,
    insightOveragePrice: 0.1,
  },
  studio: {
    label: "Studio",
    price: "$99/mo",
    clients: 10,
    sourceTypes: 12,
    teamMembers: Infinity,
    mcpCallsPerMonth: 25_000,
    insightsPerMonth: 500,
    insightOveragePrice: 0.1,
  },
  agency: {
    label: "Agency",
    price: "$249/mo",
    clients: 25,
    sourceTypes: 18,
    teamMembers: Infinity,
    mcpCallsPerMonth: 100_000,
    insightsPerMonth: 2_000,
    insightOveragePrice: 0.1,
  },
  scale: {
    label: "Scale",
    price: "$499/mo",
    clients: 75,
    sourceTypes: Infinity,
    teamMembers: Infinity,
    mcpCallsPerMonth: 500_000,
    insightsPerMonth: 10_000,
    insightOveragePrice: 0.05,
  },
  enterprise: {
    label: "Enterprise",
    price: "Custom",
    clients: Infinity,
    sourceTypes: Infinity,
    teamMembers: Infinity,
    mcpCallsPerMonth: Infinity,
    insightsPerMonth: Infinity,
    insightOveragePrice: null,
  },
};

const SOFT_CAP_MULTIPLIER = 1.5;

export function getPlan(plan: string | undefined): PlanLimits {
  return PLAN_LIMITS[(plan as PlanId) ?? "free"] ?? PLAN_LIMITS.free;
}

/**
 * Throw if workspace is past the hard cap (soft cap × 1.5) for MCP calls this
 * month. Call this from the MCP tool wrap() before running the handler.
 */
export async function enforceUsageLimit(
  workspaceId: Id<"workspaces">,
  { isInsight }: { isInsight?: boolean } = {}
): Promise<void> {
  const [workspace, usage] = await Promise.all([
    fetchQuery(api.workspaces.get, { workspaceId }),
    fetchQuery(api.usageCounters.getCurrentPeriod, { workspaceId }),
  ]);
  if (!workspace) throw new Error("Workspace not found");
  const limits = getPlan(workspace.plan);

  const callCap = limits.mcpCallsPerMonth * SOFT_CAP_MULTIPLIER;
  if (usage.toolCalls >= callCap) {
    throw new Error(
      `Monthly MCP call limit reached (${limits.mcpCallsPerMonth.toLocaleString()} on ${limits.label}). Upgrade at /settings/billing.`
    );
  }

  if (isInsight) {
    const insightCap = limits.insightsPerMonth * SOFT_CAP_MULTIPLIER;
    if (usage.insightsCalls >= insightCap) {
      throw new Error(
        `Monthly AI insight limit reached (${limits.insightsPerMonth.toLocaleString()} on ${limits.label}). Upgrade at /settings/billing.`
      );
    }
  }
}

/**
 * Enforce the client-count cap at client creation time. Called from Convex
 * clients.create (or from a server action wrapper).
 */
export async function enforceClientLimit(workspaceId: Id<"workspaces">): Promise<void> {
  const [workspace, clients] = await Promise.all([
    fetchQuery(api.workspaces.get, { workspaceId }),
    fetchQuery(api.clients.list, { workspaceId }),
  ]);
  if (!workspace) throw new Error("Workspace not found");
  const limits = getPlan(workspace.plan);
  if (clients.length >= limits.clients) {
    const nextTier = suggestUpgrade(workspace.plan as PlanId);
    throw new Error(
      `You're at the ${limits.clients}-client limit for ${limits.label}. ` +
        `${nextTier ? `Upgrade to ${PLAN_LIMITS[nextTier].label} (${PLAN_LIMITS[nextTier].price}) for ${PLAN_LIMITS[nextTier].clients} clients.` : "Contact support for Enterprise."}`
    );
  }
}

function suggestUpgrade(current: PlanId): PlanId | null {
  const ladder: PlanId[] = ["free", "solo", "studio", "agency", "scale", "enterprise"];
  const idx = ladder.indexOf(current);
  return idx >= 0 && idx < ladder.length - 1 ? ladder[idx + 1] : null;
}

export function isSoloPlan(plan: string | undefined): boolean {
  return plan === "solo" || plan === "free";
}

import type { UsageStatus } from "@/components/app/UpgradeBanner";
import type { Persona } from "@/lib/usePersona";

// Agency demo: Northpoint Digital on the Scale plan (47 of 75 clients).
export const DEMO_USAGE = {
  mcpCalls: { used: 184_270, limit: 500_000 },
  aiInsights: { used: 1_260, limit: 10_000 },
  clients: { used: 47, limit: 75 },
  teamMembers: { used: 8, limit: Infinity },
};

// Solo demo: Tessellate Coffee on the Solo plan (1 business, 1 seat of 3 used).
export const SOLO_USAGE = {
  mcpCalls: { used: 1_420, limit: 2_500 },
  aiInsights: { used: 38, limit: 50 },
  clients: { used: 1, limit: 1 },
  teamMembers: { used: 1, limit: 3 },
};

export function getUsageForPersona(persona: Persona) {
  return persona === "solo" ? SOLO_USAGE : DEMO_USAGE;
}

export function getCurrentPlanSlug(persona: Persona): string {
  return persona === "solo" ? "solo" : "scale";
}

/**
 * Returns the first usage resource that's hit its limit, for banner display.
 * Flip the Clients `used` to 75 to preview the maxed state.
 */
export function getMaxedStatus(): UsageStatus | null {
  if (DEMO_USAGE.clients.used >= DEMO_USAGE.clients.limit) {
    return {
      resource: "clients",
      used: DEMO_USAGE.clients.used,
      limit: DEMO_USAGE.clients.limit,
      nextPlan: "Enterprise",
      planSlug: "enterprise",
    };
  }
  if (DEMO_USAGE.mcpCalls.used >= DEMO_USAGE.mcpCalls.limit) {
    return {
      resource: "MCP calls",
      used: DEMO_USAGE.mcpCalls.used,
      limit: DEMO_USAGE.mcpCalls.limit,
      nextPlan: "Enterprise",
      planSlug: "enterprise",
    };
  }
  return null;
}

import type { UsageStatus } from "@/components/app/UpgradeBanner";
import type { Persona } from "@/lib/usePersona";

// Demo grants everyone full Studio access — unlimited everything, no plan caps.
export const DEMO_USAGE = {
  mcpCalls: { used: 184_270, limit: Infinity },
  aiInsights: { used: 1_260, limit: Infinity },
  clients: { used: 47, limit: Infinity },
  teamMembers: { used: 8, limit: Infinity },
};

// Solo persona also gets unlimited Studio access in the demo.
export const SOLO_USAGE = {
  mcpCalls: { used: 1_420, limit: Infinity },
  aiInsights: { used: 38, limit: Infinity },
  clients: { used: 1, limit: Infinity },
  teamMembers: { used: 1, limit: Infinity },
};

export function getUsageForPersona(persona: Persona) {
  return persona === "solo" ? SOLO_USAGE : DEMO_USAGE;
}

export function getCurrentPlanSlug(_persona: Persona): string {
  // Everyone is on Studio (unlimited) in the demo.
  return "studio";
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

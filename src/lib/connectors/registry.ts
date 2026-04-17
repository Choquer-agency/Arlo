import type {
  ConnectorContext,
  DiscoveryResult,
  MarketingConnector,
  MarketingPlatform,
  MetricQuery,
  MetricResult,
} from "./types";
import { ConnectorError } from "./types";

import { ga4Connector } from "./ga4";
import { gscConnector } from "./gsc";
import { googleAdsConnector } from "./google-ads";
import { youtubeConnector } from "./youtube";
import { gbpConnector } from "./gbp";
import { pagespeedConnector } from "./pagespeed";
import { metaAdsConnector } from "./meta-ads";
import { linkedinAdsConnector } from "./linkedin-ads";
import { tiktokAdsConnector } from "./tiktok-ads";
import { shopifyConnector } from "./shopify";
import { stripeConnector } from "./stripe";
import { hubspotConnector } from "./hubspot";
import { mailerliteConnector } from "./mailerlite";
import { mailchimpConnector } from "./mailchimp";
import { buildCustomConnector, type CustomConnectorConfig } from "./custom";

import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const BUILTIN_REGISTRY: Record<MarketingPlatform, MarketingConnector> = {
  ga4: ga4Connector,
  gsc: gscConnector,
  google_ads: googleAdsConnector,
  youtube: youtubeConnector,
  gbp: gbpConnector,
  pagespeed: pagespeedConnector,
  meta_ads: metaAdsConnector,
  linkedin_ads: linkedinAdsConnector,
  tiktok_ads: tiktokAdsConnector,
  shopify: shopifyConnector,
  stripe: stripeConnector,
  hubspot: hubspotConnector,
  mailerlite: mailerliteConnector,
  mailchimp: mailchimpConnector,
};

export type PlatformRef = MarketingPlatform | `custom:${string}`;

/** Strictly built-in lookup (synchronous). */
export function getConnector(platform: MarketingPlatform): MarketingConnector {
  const c = BUILTIN_REGISTRY[platform];
  if (!c) throw new ConnectorError(`Unknown platform: ${platform}`, "upstream_error");
  return c;
}

export function allBuiltinPlatforms(): MarketingPlatform[] {
  return Object.keys(BUILTIN_REGISTRY) as MarketingPlatform[];
}

export function isCustomPlatform(ref: string): ref is `custom:${string}` {
  return ref.startsWith("custom:");
}

/** Resolve any platform reference — built-in or custom — into a MarketingConnector. */
export async function resolvePlatform(
  ref: PlatformRef,
  workspaceId?: Id<"workspaces">
): Promise<MarketingConnector> {
  if (isCustomPlatform(ref)) {
    if (!workspaceId) {
      throw new ConnectorError(
        "Custom connectors require workspaceId context",
        "upstream_error"
      );
    }
    const slug = ref.slice("custom:".length);
    const config = await fetchQuery(api.customConnectors.getBySlug, {
      workspaceId,
      slug,
    });
    if (!config) {
      throw new ConnectorError(`Custom connector not found: ${slug}`, "upstream_error");
    }
    return buildCustomConnector(config as unknown as CustomConnectorConfig);
  }
  return getConnector(ref as MarketingPlatform);
}

export async function listAllPlatformsForWorkspace(
  workspaceId: Id<"workspaces">
): Promise<Array<{ ref: PlatformRef; label: string; status: string; category?: string }>> {
  const builtIns = allBuiltinPlatforms().map((p) => ({
    ref: p as PlatformRef,
    label: p,
    status: BUILTIN_REGISTRY[p].status,
  }));

  let customs: Array<{ ref: PlatformRef; label: string; status: string; category?: string }> = [];
  try {
    const configs = await fetchQuery(api.customConnectors.list, { workspaceId });
    customs = configs.map((c) => ({
      ref: `custom:${c.slug}` as PlatformRef,
      label: c.name,
      status: c.status ?? "active",
      category: c.category,
    }));
  } catch {}

  return [...builtIns, ...customs];
}

export async function runQuery(
  ref: PlatformRef,
  ctx: ConnectorContext,
  query: MetricQuery
): Promise<MetricResult> {
  const connector = await resolvePlatform(ref, ctx.workspaceId);
  if (!connector.isConfigured(ctx)) {
    throw new ConnectorError(connector.missingReason(ctx), "not_connected");
  }
  return connector.fetch(ctx, query);
}

export async function discover(
  ref: PlatformRef,
  workspaceId?: Id<"workspaces">
): Promise<DiscoveryResult> {
  const connector = await resolvePlatform(ref, workspaceId);
  return connector.discover();
}

// Back-compat alias
export const allPlatforms = allBuiltinPlatforms;

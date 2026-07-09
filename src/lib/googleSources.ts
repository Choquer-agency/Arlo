import type { Doc } from "../../convex/_generated/dataModel";

/**
 * The Google sources one OAuth unlocks, described once so the dashboard
 * (portfolio) and connections (matrix) render them identically. `field` is the
 * assignment column on the client doc; `kind` matches availableAccounts[].kind.
 */
export type GoogleAssignmentField =
  | "ga4PropertyId"
  | "gscSiteUrl"
  | "googleAdsCustomerId"
  | "youtubeChannelId"
  | "gbpLocationName";

export interface GoogleSourceDef {
  key: string;
  label: string;
  short: string;
  field: GoogleAssignmentField;
  kind: string;
  /** Brand logo served from /public/sources. */
  icon: string;
  pickerLabel: string;
}

export const GOOGLE_SOURCES: GoogleSourceDef[] = [
  { key: "ga4", label: "Google Analytics 4", short: "GA4", field: "ga4PropertyId", kind: "ga4_property", icon: "/sources/ga4.svg", pickerLabel: "GA4 property" },
  { key: "gsc", label: "Search Console", short: "Search Console", field: "gscSiteUrl", kind: "gsc_site", icon: "/sources/gsc.svg", pickerLabel: "Search Console site" },
  { key: "ads", label: "Google Ads", short: "Ads", field: "googleAdsCustomerId", kind: "ads_customer", icon: "/sources/ads.svg", pickerLabel: "Ads customer" },
  { key: "gbp", label: "Business Profile", short: "GBP", field: "gbpLocationName", kind: "gbp_location", icon: "/sources/gbp.svg", pickerLabel: "Business Profile location" },
];

/** Sources not yet buildable, shown as "coming soon" with their brand logos. */
export const COMING_SOON_SOURCES = [
  // YouTube paused while its OAuth scopes are out of the consent screen (re-add
  // key "yt" to GOOGLE_SOURCES + the scopes in api/oauth/google/start to restore).
  { name: "YouTube", detail: "Channel & video analytics", icon: "/sources/youtube.svg" },
  { name: "Meta", detail: "Ads + Instagram / Facebook organic", icon: "/sources/meta.svg" },
  { name: "LinkedIn", detail: "Ads + organic", icon: "/sources/linkedin.svg" },
  { name: "Shopify", detail: "Orders & storefront", icon: "/sources/shopify.svg" },
  { name: "Stripe", detail: "Revenue & subscriptions", icon: "/sources/stripe.svg" },
];

export type Account = { id: string; name: string; kind: string };

export type SourceState = "live" | "available" | "none";

/** Resolve one source's state for a client given the account inventory. */
export function sourceState(
  client: Doc<"clients">,
  source: GoogleSourceDef,
  availableAccounts: Account[]
): { state: SourceState; value?: string; availCount: number } {
  const value = client[source.field] as string | undefined;
  const availCount = availableAccounts.filter((a) => a.kind === source.kind).length;
  if (value) return { state: "live", value, availCount };
  if (availCount > 0) return { state: "available", availCount };
  return { state: "none", availCount };
}

/** How many of the five sources are mapped (live) for this client. */
export function liveCount(client: Doc<"clients">): number {
  return GOOGLE_SOURCES.filter((s) => !!client[s.field]).length;
}

/** Sources a brand-new business opts into by default. */
export const DEFAULT_ENABLED_KEYS = ["ga4", "gsc"];

/**
 * Whether a business opts into this source. A mapped source is always enabled
 * (you can't have live data flowing from a source you've turned off). Otherwise
 * fall back to the client's explicit list, or the default set if unset.
 */
export function isSourceEnabled(client: Doc<"clients">, source: GoogleSourceDef): boolean {
  if (client[source.field]) return true;
  const set = client.enabledSources ?? DEFAULT_ENABLED_KEYS;
  return set.includes(source.key);
}

/** The sources this business has opted into (enabled or mapped). */
export function enabledSourcesFor(client: Doc<"clients">): GoogleSourceDef[] {
  return GOOGLE_SOURCES.filter((s) => isSourceEnabled(client, s));
}

/** The effective set of enabled keys, resolving the default when unset. */
export function effectiveEnabledKeys(client: Doc<"clients">): string[] {
  return enabledSourcesFor(client).map((s) => s.key);
}

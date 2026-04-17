/**
 * Dashboard widget specs — what (platform, kind) combinations the dashboard
 * widgets request from the /api/widgets route. Defining these centrally means
 * the API can validate requests against an allowlist (no arbitrary metric
 * combinations from untrusted clients) and the frontend has typed access to
 * each spec.
 */

import type { MarketingPlatform } from "@/lib/connectors/types";

export type WidgetKind =
  | "ga4_headline"
  | "ga4_top_pages"
  | "gsc_overview"
  | "gsc_top_queries"
  | "google_ads_overview"
  | "google_ads_top_campaigns"
  | "youtube_overview"
  | "youtube_top_videos"
  | "gbp_overview"
  | "gbp_breakdown";

export interface WidgetSpec {
  platform: MarketingPlatform;
  metrics: string[];
  dimensions?: string[];
  limit?: number;
}

export const WIDGET_SPECS: Record<WidgetKind, WidgetSpec> = {
  // ─── GA4 ──────────────────────────────────────────
  ga4_headline: {
    platform: "ga4",
    metrics: ["sessions", "newUsers", "conversions", "averageSessionDuration"],
  },
  ga4_top_pages: {
    platform: "ga4",
    metrics: ["sessions", "conversions"],
    dimensions: ["landingPage"],
    limit: 5,
  },

  // ─── Search Console ───────────────────────────────
  gsc_overview: {
    platform: "gsc",
    metrics: ["clicks", "impressions", "ctr", "position"],
  },
  gsc_top_queries: {
    platform: "gsc",
    metrics: ["clicks", "impressions", "position"],
    dimensions: ["query"],
    limit: 5,
  },

  // ─── Google Ads ───────────────────────────────────
  google_ads_overview: {
    platform: "google_ads",
    metrics: [
      "metrics.cost_micros",
      "metrics.conversions",
      "metrics.conversions_value",
      "metrics.clicks",
    ],
  },
  google_ads_top_campaigns: {
    platform: "google_ads",
    metrics: ["metrics.cost_micros", "metrics.conversions"],
    dimensions: ["campaign.name"],
    limit: 5,
  },

  // ─── YouTube ──────────────────────────────────────
  youtube_overview: {
    platform: "youtube",
    metrics: [
      "views",
      "estimatedMinutesWatched",
      "subscribersGained",
      "averageViewDuration",
    ],
  },
  youtube_top_videos: {
    platform: "youtube",
    metrics: ["views", "estimatedMinutesWatched"],
    dimensions: ["video"],
    limit: 5,
  },

  // ─── Google Business Profile ──────────────────────
  gbp_overview: {
    platform: "gbp",
    metrics: [
      "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
      "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
      "BUSINESS_DIRECTION_REQUESTS",
      "CALL_CLICKS",
    ],
  },
  gbp_breakdown: {
    platform: "gbp",
    metrics: ["BUSINESS_DIRECTION_REQUESTS", "WEBSITE_CLICKS", "CALL_CLICKS"],
  },
};

export function getWidgetSpec(kind: WidgetKind): WidgetSpec {
  return WIDGET_SPECS[kind];
}

"use client";

import posthog from "posthog-js";

/**
 * Client-side PostHog wrapper for the Arlo app. Everything funnels through
 * `track()` so event names stay consistent and typo-free. Analytics is a no-op
 * until NEXT_PUBLIC_POSTHOG_KEY is set, so the app runs fine without it.
 */

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export const analyticsEnabled = Boolean(POSTHOG_KEY);

/** Canonical event names — the whole product's taxonomy lives here. */
export type ArloEvent =
  | "session_started"
  | "dashboard_viewed"
  | "connections_viewed"
  | "google_connect_started"
  | "source_mapped"
  | "source_enabled"
  | "source_disabled"
  | "client_added"
  | "connect_claude_viewed"
  | "mcp_url_copied"
  | "mcp_token_rotated"
  | "open_claude"
  | "prompt_copied";

export function track(event: ArloEvent, props?: Record<string, unknown>) {
  if (!analyticsEnabled) return;
  posthog.capture(event, props);
}

export { posthog };

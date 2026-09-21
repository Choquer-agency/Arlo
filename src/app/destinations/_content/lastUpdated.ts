/**
 * Per-destination "last meaningfully changed" dates for /destinations/[slug].
 * Drives both this page's own `dateModified` JSON-LD (route.ts) and
 * sitemap.ts's <lastmod> for the same URL, so the two signals stay in sync —
 * split out from route.ts because Next.js rejects any route.ts export that
 * isn't a recognized route field.
 */
export const CONTENT_LAST_UPDATED = "2026-08-27";
export const CONTENT_LAST_UPDATED_OVERRIDES: Record<string, string> = {
  tableau: "2026-09-07", // added the comparison section
  google_sheets: "2026-09-17", // added the comparison section
};

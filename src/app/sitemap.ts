import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { services } from "@/content/services";
import { getAllBlogPosts } from "@/content/blog";
import { comparisons, getAllComparisonSlugs } from "@/content/comparisons";
import { connectors, getAllConnectorSlugs } from "@/content/connectors";
import { DESTINATION_CATALOG } from "@/lib/destinations/catalog";
import {
  CONTENT_LAST_UPDATED as DESTINATION_LAST_UPDATED,
  CONTENT_LAST_UPDATED_OVERRIDES as DESTINATION_LAST_UPDATED_OVERRIDES,
} from "./destinations/_content/lastUpdated";

// Stable lastmod for pages with no per-page "last changed" data of their own
// (homepage, pricing, about, contact, and the /destinations, /compare index
// pages). Using `new Date()` stamped every URL with "modified now" on every
// build — a false signal Google ignores/distrusts. Bump this when one of
// these specific pages is meaningfully updated.
const STATIC_LASTMOD = "2026-07-04";

// All 6 /services/[slug] shells share this hardcoded dateModified (see e.g.
// src/app/services/seo-specialist/_shell.html) — mirrored here rather than
// the blanket STATIC_LASTMOD above so the sitemap doesn't understate a real
// content change. Keep in sync if a services shell's dateModified moves.
const SERVICES_LAST_UPDATED = "2026-09-03";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const serviceSlugs = services.map((s) => s.slug);
  const blogPosts = await getAllBlogPosts();
  const comparisonSlugs = getAllComparisonSlugs();
  const connectorSlugs = getAllConnectorSlugs();
  const destinationSlugs = DESTINATION_CATALOG.map((d) => d.id);

  const serviceEntries: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: SERVICES_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...serviceEntries,
    {
      url: `${SITE_URL}/pricing`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...destinationSlugs.map((slug) => ({
      url: `${SITE_URL}/destinations/${slug}`,
      lastModified: DESTINATION_LAST_UPDATED_OVERRIDES[slug] ?? DESTINATION_LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/compare`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...comparisonSlugs.map((slug) => ({
      url: `${SITE_URL}/compare/${slug}`,
      lastModified: comparisons[slug]?.lastUpdated ?? STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...connectorSlugs.map((slug) => ({
      url: `${SITE_URL}/connect/${slug}`,
      lastModified: connectors[slug]?.lastUpdated ?? STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.modifiedDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { services } from "@/content/services";
import { getAllBlogPosts } from "@/content/blog";
import { getAllComparisonSlugs } from "@/content/comparisons";
import { getAllConnectorSlugs } from "@/content/connectors";
import { DESTINATION_CATALOG } from "@/lib/destinations/catalog";

// Stable lastmod for static/marketing pages. Using `new Date()` stamped every
// URL with "modified now" on every build — a false signal Google ignores/distrusts.
// Bump this when marketing pages are meaningfully updated.
const STATIC_LASTMOD = "2026-07-04";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const serviceSlugs = services.map((s) => s.slug);
  const blogPosts = await getAllBlogPosts();
  const comparisonSlugs = getAllComparisonSlugs();
  const connectorSlugs = getAllConnectorSlugs();
  const destinationSlugs = DESTINATION_CATALOG.map((d) => d.id);

  const serviceEntries: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: STATIC_LASTMOD,
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
      lastModified: STATIC_LASTMOD,
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
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...connectorSlugs.map((slug) => ({
      url: `${SITE_URL}/connect/${slug}`,
      lastModified: STATIC_LASTMOD,
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

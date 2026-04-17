import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { getTier1Services } from "@/content/services";
import { getAllCaseStudySlugs } from "@/content/case-studies";
import { getAllBlogPosts } from "@/content/blog";
import { getAllComparisonSlugs } from "@/content/comparisons";
import { DESTINATION_CATALOG } from "@/lib/destinations/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const serviceSlugs = getTier1Services().map((s) => s.slug);
  const caseStudySlugs = getAllCaseStudySlugs();
  const blogPosts = await getAllBlogPosts();
  const comparisonSlugs = getAllComparisonSlugs();
  const destinationSlugs = DESTINATION_CATALOG.map((d) => d.id);

  const serviceEntries: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...serviceEntries,
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...caseStudyEntries,
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...destinationSlugs.map((slug) => ({
      url: `${SITE_URL}/destinations/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...comparisonSlugs.map((slug) => ({
      url: `${SITE_URL}/compare/${slug}`,
      lastModified: new Date(),
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

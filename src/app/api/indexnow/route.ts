import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/siteConfig";
import { getTier1Services } from "@/content/services";
import { getAllBlogPosts } from "@/content/blog";
import { getAllCaseStudySlugs } from "@/content/case-studies";

const INDEXNOW_KEY = "ca45c7a616742eea062e85f715f6f354";

export async function POST() {
  const serviceSlugs = getTier1Services().map((s) => s.slug);
  const caseStudySlugs = getAllCaseStudySlugs();
  const blogPosts = await getAllBlogPosts();

  const urls = [
    SITE_URL,
    `${SITE_URL}/about`,
    `${SITE_URL}/services`,
    `${SITE_URL}/work`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/contact`,
    ...serviceSlugs.map((s) => `${SITE_URL}/services/${s}`),
    ...caseStudySlugs.map((s) => `${SITE_URL}/work/${s}`),
    ...blogPosts.map((p) => `${SITE_URL}/blog/${p.slug}`),
  ];

  const payload = {
    host: "askarlo.app",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      status: response.status,
      urlsSubmitted: urls.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit to IndexNow" },
      { status: 500 }
    );
  }
}

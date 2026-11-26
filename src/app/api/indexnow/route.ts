import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/siteConfig";
import sitemap from "@/app/sitemap";

const INDEXNOW_KEY = "ca45c7a616742eea062e85f715f6f354";

export async function POST() {
  // Derive the submitted URL list from the sitemap generator itself (single
  // source of truth) instead of a hand-maintained duplicate list — a
  // hand-maintained copy is exactly the drift bug class this site has hit
  // repeatedly elsewhere (stale shells, stale schema). This also means
  // /connect/* and /compare/*, the FOCUS keyword cluster's own pages, are
  // included automatically since they're already in sitemap.ts.
  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);

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

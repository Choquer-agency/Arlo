import path from "path";
import { renderPage } from "../arlo/_render";
import { getAllComparisonSlugs, getComparisonBySlug } from "@/content/comparisons";
import compareContent from "./_content/compare";

export async function GET() {
  const cards = getAllComparisonSlugs()
    .map((slug) => getComparisonBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({
      slug: p.slug,
      saasName: p.saasName,
      saasCategory: p.saasCategory,
      blurb: p.sections.problem.heading,
    }));

  const content = { ...compareContent, cards };
  const shell = path.join(process.cwd(), "src/app/compare/_shell.html");
  const raw = await renderPage(shell, content);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

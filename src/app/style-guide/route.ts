import { readFile } from "fs/promises";
import path from "path";

// Internal design rulebook. Self-contained HTML (its own CSS) but pulls the
// live /arlo/arlo-fonts.css so every specimen renders in the real ARLO faces.
// noindex — this is a reference page, not a marketing page.
export async function GET() {
  const file = path.join(process.cwd(), "src/app/style-guide/_page.html");
  const raw = await readFile(file, "utf-8");
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

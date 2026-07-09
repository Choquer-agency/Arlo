import { renderArlo } from "./arlo/_render";
import home from "./arlo/_content/home";

// Homepage (/) — the ARLO redesign. Assembled from shared component templates
// (arlo/_components/*.html) + arlo/_content/home.ts, rendered into arlo/_shell.html.
export async function GET() {
  const raw = await renderArlo(home);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

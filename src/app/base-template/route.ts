import path from "path";
import { renderPage } from "../arlo/_render";
import base from "./_content/base";

// ── ARLO BASE TEMPLATE ──────────────────────────────────────────────────────
// Starting point for every new static marketing page: nav + hero (placeholder)
// + FAQ (placeholder) + CTA + footer. All the middle sections are stripped.
// To make a new page: copy this folder (_shell.html + _content) to the new
// route, then fill the hero and insert sections between the hero and <!--@faq-->.
export async function GET() {
  const shell = path.join(process.cwd(), "src/app/base-template/_shell.html");
  const raw = await renderPage(shell, base);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

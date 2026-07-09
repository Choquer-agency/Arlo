import path from "path";
import { renderPage } from "../arlo/_render";
import contact from "./_content/contact";

// ── ARLO CONTACT (v2) ───────────────────────────────────────────────────────
// Static contact page built on the base template: homepage-style hero + three
// topic cards (bug / feature idea / enterprise) that each open a spam-hardened
// popup form. Forms POST to the same-origin /api/contact route, which persists
// each message to the Convex inbox and forwards a copy to Formspark for email.
export async function GET() {
  const shell = path.join(process.cwd(), "src/app/contact/_shell.html");
  const raw = await renderPage(shell, contact);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

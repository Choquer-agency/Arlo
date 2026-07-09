import path from "path";
import { renderPage } from "../arlo/_render";
import destinations from "./_content/destinations";

export async function GET() {
  const shell = path.join(process.cwd(), "src/app/destinations/_shell.html");
  const raw = await renderPage(shell, destinations);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

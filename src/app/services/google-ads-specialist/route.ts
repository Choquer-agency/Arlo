import path from "path";
import { renderPage } from "../../arlo/_render";
import googleAds from "./_content/google-ads";

export async function GET() {
  const shell = path.join(
    process.cwd(),
    "src/app/services/google-ads-specialist/_shell.html"
  );
  const raw = await renderPage(shell, googleAds);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

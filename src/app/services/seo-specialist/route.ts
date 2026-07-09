import path from "path";
import { renderPage } from "../../arlo/_render";
import seo from "./_content/seo";

export async function GET() {
  const shell = path.join(
    process.cwd(),
    "src/app/services/seo-specialist/_shell.html"
  );
  const raw = await renderPage(shell, seo);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

import path from "path";
import { renderPage } from "../../arlo/_render";
import agencyOwner from "./_content/agency-owner";

export async function GET() {
  const shell = path.join(
    process.cwd(),
    "src/app/services/agency-owner/_shell.html"
  );
  const raw = await renderPage(shell, agencyOwner);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

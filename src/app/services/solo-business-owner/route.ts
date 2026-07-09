import path from "path";
import { renderPage } from "../../arlo/_render";
import solo from "./_content/solo-business-owner";

export async function GET() {
  const shell = path.join(
    process.cwd(),
    "src/app/services/solo-business-owner/_shell.html"
  );
  const raw = await renderPage(shell, solo);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

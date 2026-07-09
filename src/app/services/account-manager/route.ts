import path from "path";
import { renderPage } from "../../arlo/_render";
import accountManager from "./_content/account-manager";

export async function GET() {
  const shell = path.join(
    process.cwd(),
    "src/app/services/account-manager/_shell.html"
  );
  const raw = await renderPage(shell, accountManager);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

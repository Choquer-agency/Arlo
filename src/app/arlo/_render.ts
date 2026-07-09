/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from "fs/promises";
import path from "path";

// The shared component library lives under /arlo/_components and is used by
// every page (home, service pages, …). A page provides its own shell + content.
const ARLO = path.join(process.cwd(), "src/app/arlo");
const COMPONENTS = path.join(ARLO, "_components");

function getPath(obj: any, p: string): any {
  return p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** mustache-lite: {{path}} inserts (trusted HTML, authored by us); {{#each path}}…{{/each}} loops */
function resolve(tpl: string, ctx: any): string {
  tpl = tpl.replace(/\{\{#each ([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_m, p, inner) => {
    const arr = getPath(ctx, p);
    if (!Array.isArray(arr)) return "";
    return arr.map((item) => resolve(inner, { ...ctx, ...item, this: item })).join("");
  });
  tpl = tpl.replace(/\{\{([\w.]+)\}\}/g, (_m, p) => {
    const v = getPath(ctx, p);
    return v == null ? "" : String(v);
  });
  return tpl;
}

/** Assemble a page: read its shell, replace each <!--@name--> with the shared
 *  component template rendered against this page's content[name]. */
export async function renderPage(
  shellAbsPath: string,
  content: Record<string, any> = {}
): Promise<string> {
  const shell = await readFile(shellAbsPath, "utf-8");
  const names = Array.from(
    new Set(Array.from(shell.matchAll(/<!--@([\w-]+)-->/g), (m) => m[1]))
  );
  const parts: Record<string, string> = {};
  await Promise.all(
    names.map(async (n) => {
      const tpl = await readFile(path.join(COMPONENTS, `${n}.html`), "utf-8");
      parts[n] = resolve(tpl, (content && content[n]) || {});
    })
  );
  let out = shell.replace(/<!--@([\w-]+)-->/g, (_m, n) => parts[n] ?? "");

  // Resolve any {{path}} / {{#each}} in the shell body itself against the top-level
  // content (parameterized page templates, e.g. destinations/_template). Existing
  // hardcoded shells have no {{word}} placeholders, so this is a no-op for them.
  // {{button "…"}} / {{link "…"}} contain spaces/quotes so they don't match {{word}}
  // and are left for the dedicated passes below.
  out = resolve(out, content);

  // Shared CTA button: every {{button "Text" "/href"}} anywhere (shell or
  // component) renders the ONE button.html — edit that file → all CTAs update.
  const btn = await readFile(path.join(COMPONENTS, "button.html"), "utf-8");
  out = out.replace(
    /\{\{button\s+"([^"]*)"\s+"([^"]*)"\}\}/g,
    (_m, text, href) => resolve(btn, { text, href })
  );

  // Secondary CTA: {{link "Text" "/href"}} → underline + arrow text link (NOT the
  // bright shimmer button, which is reserved for "Start For Free" sign-up only).
  const lnk = await readFile(path.join(COMPONENTS, "link.html"), "utf-8");
  out = out.replace(
    /\{\{link\s+"([^"]*)"\s+"([^"]*)"\}\}/g,
    (_m, text, href) => resolve(lnk, { text, href })
  );
  return out;
}

/** Home page convenience wrapper. */
export async function renderArlo(content: Record<string, any>): Promise<string> {
  return renderPage(path.join(ARLO, "_shell.html"), content);
}

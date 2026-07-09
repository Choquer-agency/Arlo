import path from "path";
import { renderPage } from "../../arlo/_render";
import { getComparisonBySlug } from "@/content/comparisons";
import { SITE_URL, AGENCY_NAME } from "@/lib/siteConfig";

// Chrome-shader source image for the hero (arlo-chat.js ripples it into marble).
const HERO_IMG = "/arlo/bg/venus-sunset.webp";

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SECTION_OPEN =
  '<section style="padding:56px 0;"><div class="arlo-padding-global"><div class="arlo-container-large" style="max-width:920px;margin-left:auto;margin-right:auto;">';
const SECTION_CLOSE = "</div></div></section>";
const H2 =
  "font-family:'Libre Caslon Text',Georgia,serif;font-weight:400;font-size:clamp(25px,3vw,36px);line-height:1.1;letter-spacing:-.015em;color:#14181c;margin:0 0 18px;";
const BODY = "font-family:'PP Neue Montreal',sans-serif;font-size:1.05rem;line-height:1.6;color:#5a544a;margin:0;";
const EYEBROW =
  "font-family:'Geist Pixel','Press Start 2P',monospace;font-size:14px;letter-spacing:.03em;color:#8F93FF;margin-bottom:14px;";

/* eslint-disable @typescript-eslint/no-explicit-any */
function comparisonTable(headers: string[], rows: { feature: string; values: string[] }[]) {
  const last = headers.length - 1;
  const th = headers
    .map((h, i) => {
      const hi = i === last;
      const rec = hi
        ? `<span style="display:block;font-family:'Geist Pixel',monospace;font-size:11px;color:#3f7a1e;letter-spacing:.03em;margin-top:3px;">Recommended</span>`
        : "";
      return `<th style="text-align:left;padding:14px 18px;font-weight:500;color:#14181c;${
        hi ? "background:#eaffc9;" : ""
      }${i === 0 ? "" : ""}">${esc(h)}${rec}</th>`;
    })
    .join("");
  const trs = rows
    .map(
      (r) =>
        `<tr style="border-top:1px solid #E7E3D7;"><td style="padding:14px 18px;font-weight:500;color:#14181c;">${esc(
          r.feature
        )}</td>${r.values
          .map(
            (v, i) =>
              `<td style="padding:14px 18px;color:${i === last ? "#14181c" : "#5a544a"};${
                i === last ? "background:#f4ffe1;font-weight:500;" : ""
              }">${esc(v)}</td>`
          )
          .join("")}</tr>`
    )
    .join("");
  return `<div style="overflow-x:auto;border:1px solid #E7E3D7;border-radius:16px;"><table style="width:100%;border-collapse:collapse;font-family:'PP Neue Montreal',sans-serif;font-size:0.95rem;min-width:520px;"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function tcoTable(saasName: string, rows: { label: string; saas: string; custom: string }[]) {
  const trs = rows
    .map((r) => {
      const total = /total|cumulative/i.test(r.label);
      return `<tr style="border-top:1px solid #E7E3D7;${total ? "background:#faf9f4;font-weight:500;" : ""}"><td style="padding:13px 18px;color:#14181c;">${esc(
        r.label
      )}</td><td style="padding:13px 18px;color:#5a544a;">${esc(r.saas)}</td><td style="padding:13px 18px;color:#14181c;background:#f4ffe1;">${esc(
        r.custom
      )}</td></tr>`;
    })
    .join("");
  return `<div style="overflow-x:auto;border:1px solid #E7E3D7;border-radius:16px;"><table style="width:100%;border-collapse:collapse;font-family:'PP Neue Montreal',sans-serif;font-size:0.95rem;min-width:520px;"><thead><tr><th style="text-align:left;padding:14px 18px;font-weight:500;color:#14181c;">Cost category</th><th style="text-align:left;padding:14px 18px;font-weight:500;color:#14181c;">${esc(
    saasName
  )}</th><th style="text-align:left;padding:14px 18px;font-weight:500;color:#14181c;background:#eaffc9;">ARLO</th></tr></thead><tbody>${trs}</tbody></table></div>`;
}

function whenGrid(saasName: string, whenCustom: string[], whenSaas: string[]) {
  const li = (items: string[], mark: string, markColor: string) =>
    items
      .map(
        (it) =>
          `<li style="display:flex;gap:11px;align-items:flex-start;margin-bottom:12px;"><span style="color:${markColor};flex:none;line-height:1.5;">${mark}</span><span style="font-family:'PP Neue Montreal',sans-serif;font-size:0.95rem;color:#5a544a;line-height:1.5;">${esc(
            it
          )}</span></li>`
      )
      .join("");
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;"><div style="background:#F4F3EE;border:1px solid #E7E3D7;border-radius:18px;padding:28px;"><h3 style="font-family:'PP Neue Montreal',sans-serif;font-weight:500;font-size:1.15rem;color:#14181c;margin:0 0 16px;">ARLO is the better fit when</h3><ul style="list-style:none;margin:0;padding:0;">${li(
    whenCustom,
    "✓",
    "#3f7a1e"
  )}</ul></div><div style="background:#fff;border:1px solid #E7E3D7;border-radius:18px;padding:28px;"><h3 style="font-family:'PP Neue Montreal',sans-serif;font-weight:500;font-size:1.15rem;color:#14181c;margin:0 0 16px;">Stick with ${esc(
    saasName
  )} when</h3><ul style="list-style:none;margin:0;padding:0;">${li(whenSaas, "—", "#b1ada1")}</ul></div></div>`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const page = getComparisonBySlug(slug);
  if (!page) return new Response("Not found", { status: 404 });
  const { sections } = page;

  const updated = new Date(page.lastUpdated).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ── Body sections (rendered between the hero and the shared FAQ) ──
  const parts: string[] = [];
  parts.push(
    `${SECTION_OPEN}<h2 style="${H2}">${esc(sections.problem.heading)}</h2><p style="${BODY}">${esc(
      sections.problem.body
    )}</p>${SECTION_CLOSE}`
  );
  parts.push(
    `${SECTION_OPEN}<div style="${EYEBROW}">Feature comparison</div>${comparisonTable(
      sections.table.headers,
      sections.table.rows
    )}${SECTION_CLOSE}`
  );
  if (sections.tco) {
    parts.push(
      `${SECTION_OPEN}<div style="${EYEBROW}">Total cost of ownership</div><h2 style="${H2}">${esc(
        sections.tco.heading
      )}</h2>${tcoTable(page.saasName, sections.tco.rows)}<p style="font-family:'PP Neue Montreal',sans-serif;font-size:0.95rem;color:#3f7a1e;font-weight:500;margin:16px 0 0;">${esc(
        sections.tco.savingsNote
      )}</p>${SECTION_CLOSE}`
    );
  }
  parts.push(`${SECTION_OPEN}${whenGrid(page.saasName, sections.whenCustom, sections.whenSaas)}${SECTION_CLOSE}`);
  if (sections.caseStudy) {
    parts.push(
      `${SECTION_OPEN}<div style="background:#fff;border:1px solid #E7E3D7;border-radius:20px;padding:34px;"><div style="${EYEBROW}">Real-world result</div><h3 style="font-family:'PP Neue Montreal',sans-serif;font-weight:500;font-size:1.35rem;color:#14181c;margin:0 0 16px;line-height:1.25;">${esc(
        sections.caseStudy.client
      )}: ${esc(sections.caseStudy.headline)}</h3><ul style="list-style:none;margin:0;padding:0;">${sections.caseStudy.metrics
        .map(
          (m: string) =>
            `<li style="display:flex;gap:11px;align-items:flex-start;margin-bottom:10px;"><span style="color:#8F93FF;flex:none;">•</span><span style="font-family:'PP Neue Montreal',sans-serif;font-size:0.98rem;color:#5a544a;font-weight:500;">${esc(
              m
            )}</span></li>`
        )
        .join("")}</ul></div>${SECTION_CLOSE}`
    );
  }
  parts.push(
    `${SECTION_OPEN}<a href="/services/${page.serviceSlug}" style="font-family:'PP Neue Montreal',sans-serif;font-size:1rem;color:#8F93FF;text-decoration:none;">← Learn more about ARLO for ${esc(
      page.saasCategory
    )}</a>${SECTION_CLOSE}`
  );
  const bodyHtml = parts.join("");

  // ── JSON-LD: WebPage + FAQPage + Breadcrumb ──
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.title,
        description: page.metaDescription,
        url: `${SITE_URL}/compare/${page.slug}`,
        dateModified: page.lastUpdated,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
            { "@type": "ListItem", position: 3, name: page.saasName },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: sections.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };
  const schemaHtml = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;

  const content = {
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    title: page.title,
    canonicalUrl: `${SITE_URL}/compare/${page.slug}`,
    heroEyebrow: `${page.saasName} vs. ARLO · Updated ${updated}`,
    heroBody: page.tldr,
    heroImg: HERO_IMG,
    bodyHtml,
    schemaHtml,
    faq: {
      eyebrow: "FAQ",
      heading: "Questions, answered",
      subtext: `Common questions about ${page.saasName} vs. ARLO.`,
      contactPre: "Still comparing? Talk to our",
      contactHref: "/contact",
      contactLink: "team",
      items: sections.faqs.map((f) => ({ q: f.question, a: f.answer })),
    },
    cta: {
      eyebrow: "Get started",
      heading: `Skip the ${page.saasCategory.toLowerCase()}. Just ask Claude.`,
      buttonText: "Start For Free",
      buttonHref: "/welcome",
    },
    agencyName: AGENCY_NAME,
  };

  const shell = path.join(process.cwd(), "src/app/compare/[slug]/_shell.html");
  const raw = await renderPage(shell, content as any);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

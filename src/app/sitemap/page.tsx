import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site map — every ARLO page & status",
  robots: { index: false, follow: false },
};

/* ── Status system ─────────────────────────────────────────────── */
type Status = "live" | "staging" | "update" | "app" | "todo";
const STATUS: Record<Status, { label: string; dot: string; chipBg: string; chipFg: string }> = {
  live: { label: "Live", dot: "#3f7a1e", chipBg: "#e6f4d9", chipFg: "#3f7a1e" },
  staging: { label: "Staging", dot: "#8f7a2a", chipBg: "#f7f0cf", chipFg: "#8f7a2a" },
  update: { label: "Needs update", dot: "#b4472e", chipBg: "#f7ded4", chipFg: "#b4472e" },
  app: { label: "App / internal", dot: "#6b6fc4", chipBg: "#ecedfb", chipFg: "#6b6fc4" },
  todo: { label: "Missing / to build", dot: "#8f897c", chipBg: "#ede9e0", chipFg: "#7a7367" },
};

type Row = { path: string; name: string; status: Status; note?: string };
type Section = { title: string; sub?: string; rows: Row[] };

const SECTIONS: Section[] = [
  {
    title: "Core marketing",
    sub: "The public front door.",
    rows: [
      { path: "/", name: "Home", status: "live", note: "ARLO redesign — promoted from /arlo (which now 308-redirects here)" },
      { path: "/about", name: "About", status: "live", note: "Redesign promoted from /about-2" },
      { path: "/pricing", name: "Pricing", status: "live", note: "New — promoted from /pricing-2; free-now messaging" },
      { path: "/blog", name: "Blog", status: "live", note: "Redesign promoted from /blog-2; detail pages at /blog/[slug]" },
      { path: "/contact", name: "Contact", status: "live", note: "Redesign promoted from /contact-2" },
      { path: "/destinations", name: "Destinations index", status: "live" },
      { path: "/compare/windsor-ai", name: "Compare (/[slug])", status: "live", note: "Programmatic comparison pages" },
      { path: "/welcome", name: "Welcome / signup CTA", status: "live", note: "All 'Start free' buttons land here" },
    ],
  },
  {
    title: "Internal",
    sub: "All redesigns (Home / About / Pricing / Blog / Contact) have been promoted onto their real URLs.",
    rows: [
      { path: "/base-template", name: "Base template", status: "live", note: "noindex — source for every new page" },
      { path: "/style-guide", name: "Style guide", status: "live" },
    ],
  },
  {
    title: "Services — role pages",
    sub: "Six audience-specific service pages. The /services index was removed; nav 'Services' is now a dropdown only.",
    rows: [
      { path: "/services/seo-specialist", name: "SEO specialist", status: "live" },
      { path: "/services/google-ads-specialist", name: "Google Ads specialist", status: "live" },
      { path: "/services/meta-ads-specialist", name: "Meta Ads specialist", status: "live" },
      { path: "/services/account-manager", name: "Account manager", status: "live" },
      { path: "/services/agency-owner", name: "Agency owner", status: "live" },
      { path: "/services/solo-business-owner", name: "Solo business owner", status: "live" },
    ],
  },
  {
    title: "Destinations — 15 connectors",
    sub: "One parameterized route (/destinations/[slug]) + per-destination branded PDF.",
    rows: [
      { path: "/destinations/looker_studio", name: "Looker Studio", status: "live" },
      { path: "/destinations/power_bi", name: "Power BI", status: "live" },
      { path: "/destinations/tableau", name: "Tableau", status: "live" },
      { path: "/destinations/google_sheets", name: "Google Sheets", status: "live" },
      { path: "/destinations/excel", name: "Excel", status: "live" },
      { path: "/destinations/bigquery", name: "BigQuery", status: "live" },
      { path: "/destinations/snowflake", name: "Snowflake", status: "live" },
      { path: "/destinations/redshift", name: "Redshift", status: "live" },
      { path: "/destinations/databricks", name: "Databricks", status: "live" },
      { path: "/destinations/slack_digest", name: "Slack digest", status: "live" },
      { path: "/destinations/email_digest", name: "Email digest", status: "live" },
      { path: "/destinations/pdf_report", name: "PDF report", status: "live" },
      { path: "/destinations/notion_destination", name: "Notion", status: "live" },
      { path: "/destinations/airtable_destination", name: "Airtable", status: "live" },
      { path: "/destinations/shareable_dashboard", name: "Shareable dashboard", status: "live" },
    ],
  },
  {
    title: "Blog posts",
    sub: "4 SEO-briefed posts. Newest is featured; grid starts at #2.",
    rows: [
      { path: "/blog/100-questions-to-ask-google-analytics", name: "100 Questions to Ask GA", status: "live", note: "Featured / latest" },
      { path: "/blog/how-choquer-agency-uses-arlo", name: "How Choquer Agency uses ARLO", status: "live", note: "Founding/lock-in copy scrubbed" },
      { path: "/blog/how-to-use-ai-for-seo", name: "How to use AI for SEO", status: "live" },
      { path: "/blog/how-to-install-arlo-vs-windsor-ai", name: "Install ARLO vs Windsor.ai", status: "live" },
    ],
  },
  {
    title: "App / product / auth",
    sub: "Behind sign-in — the real product surfaces.",
    rows: [
      { path: "/dashboard", name: "Dashboard", status: "app" },
      { path: "/solo-dashboard", name: "Solo dashboard", status: "app" },
      { path: "/clients", name: "Clients", status: "app" },
      { path: "/connections", name: "Connections", status: "app" },
      { path: "/team", name: "Team", status: "app" },
      { path: "/admin", name: "Admin", status: "app" },
      { path: "/onboarding", name: "Onboarding", status: "app" },
      { path: "/sign-in", name: "Sign in", status: "app" },
      { path: "/oauth/authorize", name: "OAuth authorize", status: "app" },
      { path: "/preview/demo", name: "Preview (/[token])", status: "app" },
      { path: "/share/demo", name: "Share (/[token])", status: "app" },
    ],
  },
  {
    title: "Demo surfaces",
    sub: "Public, logged-out previews of the product UI.",
    rows: [
      { path: "/demo/dashboard", name: "Demo dashboard", status: "live" },
      { path: "/demo/solo-dashboard", name: "Demo solo dashboard", status: "live" },
      { path: "/demo/clients", name: "Demo clients", status: "live" },
      { path: "/demo/connections", name: "Demo connections", status: "live" },
      { path: "/demo/custom-connectors", name: "Demo custom connectors", status: "live" },
      { path: "/demo/prompts", name: "Demo prompts", status: "live" },
      { path: "/demo/team", name: "Demo team", status: "live" },
    ],
  },
  {
    title: "Legal",
    rows: [
      { path: "/privacy", name: "Privacy policy", status: "live" },
      { path: "/terms", name: "Terms", status: "live" },
    ],
  },
];

/* ── Cross-reference: what still needs updating ────────────────── */
const TODOS: { title: string; detail: string; sev: Status }[] = [
  { sev: "update", title: "Stale pricing FAQ in shared.ts", detail: "The shared FAQ still says '14-day trial · permanent Free tier · test one client forever' — contradicts the new free-now / choose-or-walk-away model. Rewrite to match." },
  { sev: "todo", title: "Wire lead capture", detail: "Feature-idea modal, gated destination PDFs, and blog CTAs all POST best-effort to /api/lead-report. Point it at a real destination (Convex / CRM / email)." },
];

/* ── Render ────────────────────────────────────────────────────── */
function Chip({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.chipBg, color: s.chipFg, fontSize: 11, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

export default function SiteMapPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="/arlo/arlo-fonts.css" />
      <main style={{ background: "#F4F3EE", minHeight: "100vh", color: "#14181c", fontFamily: "'PP Neue Montreal','Inter',system-ui,sans-serif", padding: "56px 5vw 100px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ fontFamily: "'Geist Pixel','Press Start 2P',monospace", fontSize: 13, letterSpacing: ".04em", color: "#8F93FF", marginBottom: 14 }}>
            Internal · noindex
          </div>
          <h1 style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontWeight: 400, fontSize: "clamp(34px,4.5vw,54px)", lineHeight: 1.04, letterSpacing: "-.015em", margin: 0, maxWidth: "18ch" }}>
            Every page, and what still needs work.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "#5a544a", maxWidth: 560, marginTop: 18 }}>
            A live index of every route on askarlo.app. Click any page to open it. Legend below shows status at a glance.
          </p>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
            {(Object.keys(STATUS) as Status[]).map((k) => (
              <Chip key={k} status={k} />
            ))}
          </div>

          {/* What needs updating */}
          <section style={{ marginTop: 44, background: "#fff", border: "1px solid #E7E3D7", borderRadius: 20, padding: "30px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#b4472e" }} />
              <h2 style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontWeight: 400, fontSize: 26, margin: 0 }}>
                What still needs updating
              </h2>
            </div>
            <p style={{ fontSize: 14, color: "#8f897c", margin: "0 0 22px", paddingLeft: 19 }}>
              Cross-referenced across routes, footer links, and shared content.
            </p>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
              {TODOS.map((t, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12, alignItems: "start" }}>
                  <span style={{ fontFamily: "'Geist Pixel','Press Start 2P',monospace", fontSize: 13, color: "#8F93FF", lineHeight: 1.5 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 500, fontSize: 16 }}>{t.title}</span>
                      <Chip status={t.sev} />
                    </div>
                    <div style={{ fontSize: 14.5, color: "#5a544a", lineHeight: 1.5, marginTop: 3 }}>{t.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Sections */}
          {SECTIONS.map((sec) => (
            <section key={sec.title} style={{ marginTop: 48 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                <h2 style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontWeight: 400, fontSize: 27, margin: 0 }}>{sec.title}</h2>
                <span style={{ fontSize: 13, color: "#a39d90" }}>{sec.rows.length} page{sec.rows.length === 1 ? "" : "s"}</span>
              </div>
              {sec.sub && <p style={{ fontSize: 14.5, color: "#8f897c", margin: "0 0 18px" }}>{sec.sub}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 12 }}>
                {sec.rows.map((r) => {
                  const s = STATUS[r.status];
                  return (
                    <a key={r.path} href={r.path} style={{ display: "block", textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid #E7E3D7", borderLeft: `3px solid ${s.dot}`, borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 500, fontSize: 15.5 }}>{r.name}</span>
                        <Chip status={r.status} />
                      </div>
                      <div style={{ fontFamily: "'Geist Mono',ui-monospace,monospace", fontSize: 12.5, color: "#8F93FF", marginTop: 4 }}>{r.path}</div>
                      {r.note && <div style={{ fontSize: 13, color: "#8f897c", lineHeight: 1.45, marginTop: 7 }}>{r.note}</div>}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}

          {/* API footnote */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontWeight: 400, fontSize: 27, margin: "0 0 4px" }}>API endpoints</h2>
            <p style={{ fontSize: 14.5, color: "#8f897c", margin: "0 0 16px" }}>Server routes (not pages). Listed for completeness.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["/api/contact", "/api/lead-report", "/api/mcp", "/api/oauth/google/start", "/api/oauth/google/callback", "/api/destinations/live/looker-studio", "/api/destinations/test", "/api/cron/destinations", "/api/stripe/checkout", "/api/stripe/portal", "/api/webhooks/stripe", "/api/webhook/formspark", "/api/indexnow", "/api/widgets"].map((p) => (
                <span key={p} style={{ fontFamily: "'Geist Mono',ui-monospace,monospace", fontSize: 12.5, color: "#5a544a", background: "#fff", border: "1px solid #E7E3D7", borderRadius: 8, padding: "5px 10px" }}>{p}</span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

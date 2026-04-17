import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AGENCY_NAME } from "@/lib/siteConfig";
import {
  DESTINATION_CATALOG,
  FAMILY_LABELS,
  STATUS_LABELS,
  SYNC_MODE_LABELS,
  findDestination,
  type DestinationEntry,
  type DestinationSyncMode,
} from "@/lib/destinations/catalog";

const STATUS_STYLES: Record<DestinationEntry["status"], string> = {
  live: "bg-mint text-brand",
  beta: "bg-bg-yellow/50 text-dark",
  coming_soon: "bg-bg-blue/40 text-dark",
  waitlist: "bg-grey text-dark opacity-70",
};

const MODE_EXPLAINERS: Record<
  DestinationSyncMode,
  { title: string; body: string; bullets: string[] }
> = {
  live: {
    title: "Live connector — the BI tool pulls from ARLO on refresh",
    body: "Nothing is stored in the destination. When your client hits refresh, the dashboard queries ARLO directly — one authentication, always fresh.",
    bullets: [
      "No scheduled sync, no stale data, no export pipeline",
      "Auth with an ARLO connector token scoped to the client",
      "Scope locks the token — it can only ever return that client's data",
    ],
  },
  push: {
    title: "Scheduled push — ARLO writes rows on a schedule you pick",
    body: "ARLO queries your connected sources and writes the result into the destination. Pick metrics, pick dimensions, pick cadence — 15 min, hourly, daily, or on-demand.",
    bullets: [
      "Service-account or OAuth authentication per destination",
      "Incremental loads where possible; full refresh otherwise",
      "Failed runs surface in the audit log with retry metadata",
    ],
  },
  digest: {
    title: "Scheduled digest — ARLO renders and delivers",
    body: "Instead of raw rows, ARLO renders a narrative: top campaigns, anomalies, week-over-week deltas. Delivered to Slack, email, or as a branded PDF.",
    bullets: [
      "Templated blocks: KPI tiles, charts, Claude-written narrative",
      "Schedule it per client (daily brief, weekly wrap, monthly review)",
      "Branding reads from the client — logo, colors, naming",
    ],
  },
};

export function generateStaticParams() {
  return DESTINATION_CATALOG.map((d) => ({ slug: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = findDestination(slug);
  if (!d) return { title: `Destination | ${AGENCY_NAME}` };
  return {
    title: `${d.name} | Destinations | ${AGENCY_NAME}`,
    description: d.tagline,
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = findDestination(slug);
  if (!dest) notFound();

  const mode = MODE_EXPLAINERS[dest.syncMode];
  const siblings = DESTINATION_CATALOG.filter(
    (d) => d.family === dest.family && d.id !== dest.id
  );
  const comingLater = dest.status === "coming_soon" || dest.status === "waitlist";

  return (
    <ClientLayout>
      <Nav />

      <header className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <p className="eyebrow mb-4">
            <Link href="/destinations" className="text-brand hover:underline">
              Destinations
            </Link>
            <span className="text-dark opacity-40"> / {FAMILY_LABELS[dest.family]}</span>
          </p>

          <div className="flex items-start gap-5 mb-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-display text-white text-2xl flex-shrink-0"
              style={{ backgroundColor: dest.color }}
            >
              {dest.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark mb-3">
                {dest.name}
              </h1>
              <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[52ch] leading-relaxed">
                {dest.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wider">
            <span className={`px-3 py-1.5 rounded border border-dark-faded ${STATUS_STYLES[dest.status]}`}>
              {STATUS_LABELS[dest.status]}
              {dest.eta ? ` · ${dest.eta}` : ""}
            </span>
            <span className="px-3 py-1.5 rounded border bg-white text-dark border-dark-faded">
              {SYNC_MODE_LABELS[dest.syncMode]}
            </span>
            <span className="px-3 py-1.5 rounded border bg-white text-dark border-dark-faded">
              {FAMILY_LABELS[dest.family]}
            </span>
            {dest.perClient && (
              <span className="px-3 py-1.5 rounded border bg-white text-dark border-dark-faded">
                Per-client
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="section-space-main" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Agency use case */}
            <div className="bg-white border border-dark-faded rounded-lg p-8">
              <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3">
                Why agencies use this
              </p>
              <p className="font-sans text-fluid-large text-dark leading-relaxed">
                {dest.agencyUseCase}
              </p>
            </div>

            {/* How it works */}
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
                How it works
              </p>
              <div className="bg-white border border-dark-faded rounded-lg p-8">
                <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-3">
                  {mode.title}
                </h2>
                <p className="font-sans text-fluid-main text-dark opacity-60 mb-5 max-w-[58ch]">
                  {mode.body}
                </p>
                <ul className="space-y-2">
                  {mode.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-dark">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      <span className="font-sans text-fluid-main opacity-80">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Templates */}
            {dest.templates && dest.templates.length > 0 && (
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
                  Starter templates
                </p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {dest.templates.map((t) => (
                    <div
                      key={t}
                      className="bg-white border border-dark-faded rounded-lg p-5"
                    >
                      <p className="font-sans text-dark">{t}</p>
                      <p className="font-mono text-[11px] text-dark opacity-50 mt-1">
                        Clone · edit · assign per client
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-dark text-white rounded-lg p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <p className="font-sans text-fluid-h5 mb-2">
                  {comingLater
                    ? `${dest.name} is on the roadmap`
                    : `Connect ${dest.name} to a client`}
                </p>
                <p className="font-sans text-fluid-main opacity-70">
                  {comingLater
                    ? "Join the waitlist — we ship destinations in the order agencies vote for them."
                    : "Pick sources, pick cadence, done. Runs inside your ARLO workspace with the client's scope locked."}
                </p>
              </div>
              <Link
                href={comingLater ? "/contact" : "/sign-in"}
                className="btn-secondary whitespace-nowrap px-6 py-3"
              >
                {comingLater ? "Join waitlist" : "Open in ARLO →"}
              </Link>
            </div>

            {/* Compatible sources cross-link */}
            <div className="border-t border-dark-faded pt-8">
              <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
                Works with every ARLO source
              </p>
              <p className="font-sans text-fluid-main text-dark opacity-70 max-w-[56ch]">
                Any platform you&apos;ve connected — GA4, Google Ads, Search Console, Meta,
                Shopify, custom REST — can flow into {dest.name}. You pick which metrics
                and dimensions per sync.{" "}
                <Link href="/demo/connections" className="text-brand hover:underline">
                  Browse all sources →
                </Link>
              </p>
            </div>

            {/* Sibling destinations */}
            {siblings.length > 0 && (
              <div className="border-t border-dark-faded pt-8">
                <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
                  Other {FAMILY_LABELS[dest.family].toLowerCase()} destinations
                </p>
                <div className="flex flex-wrap gap-3">
                  {siblings.map((s) => (
                    <Link
                      key={s.id}
                      href={`/destinations/${s.id}`}
                      className="flex items-center gap-2 bg-white border border-dark-faded rounded px-3 py-2 hover:border-dark transition-colors"
                    >
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center font-display text-white text-xs"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.name.charAt(0)}
                      </span>
                      <span className="font-sans text-sm text-dark">{s.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-50">
                        {STATUS_LABELS[s.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </ClientLayout>
  );
}

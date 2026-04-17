import type { Metadata } from "next";
import Link from "next/link";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AGENCY_NAME } from "@/lib/siteConfig";
import {
  DESTINATION_CATALOG,
  DESTINATION_COUNT,
  DESTINATION_LIVE_COUNT,
  DESTINATION_BETA_COUNT,
  DESTINATION_COMING_SOON_COUNT,
  FAMILY_LABELS,
  STATUS_LABELS,
  SYNC_MODE_LABELS,
  type DestinationFamily,
  type DestinationEntry,
} from "@/lib/destinations/catalog";

export const metadata: Metadata = {
  title: `Destinations | ${AGENCY_NAME}`,
  description:
    "Sync ARLO data to Looker Studio, Google Sheets, BigQuery, Snowflake, Slack, branded PDFs, and more. Same data, every surface your client already uses.",
};

const FAMILY_ORDER: DestinationFamily[] = ["bi", "spreadsheet", "warehouse", "agency"];

const FAMILY_SUBLINES: Record<DestinationFamily, string> = {
  bi: "Live dashboards clients can open and refresh. No export, no stale CSVs.",
  spreadsheet: "Scheduled tabs that refresh themselves. The weekly review email always has today's numbers.",
  warehouse: "Stream source data into the client's data stack so analysts query ARLO like dbt.",
  agency: "Narratives and artifacts your team would otherwise build by hand — Slack digests, PDF reports, shareable links.",
};

const STATUS_STYLES: Record<DestinationEntry["status"], string> = {
  live: "bg-mint text-brand",
  beta: "bg-bg-yellow/50 text-dark",
  coming_soon: "bg-bg-blue/40 text-dark",
  waitlist: "bg-grey text-dark opacity-70",
};

export default function DestinationsPage() {
  const grouped: Record<DestinationFamily, DestinationEntry[]> = {
    bi: [],
    spreadsheet: [],
    warehouse: [],
    agency: [],
  };
  for (const d of DESTINATION_CATALOG) grouped[d.family].push(d);

  return (
    <ClientLayout>
      <Nav />

      <header className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <p className="eyebrow text-brand mb-4">Destinations</p>
          <h1 className="font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark max-w-[22ch] mb-6">
            Your data, in the tool your client already opens.
          </h1>
          <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[56ch] leading-relaxed mb-8">
            ARLO already pipes 325+ platforms to Claude. Destinations push that same data
            outward — Looker Studio, Google Sheets, BigQuery, Snowflake, Slack digests,
            branded PDFs. Pick the surface. We keep it fresh.
          </p>

          <div className="flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wider">
            <span className="px-3 py-1.5 rounded border bg-mint text-brand border-brand-neon/40">
              {DESTINATION_LIVE_COUNT} live
            </span>
            <span className="px-3 py-1.5 rounded border bg-bg-yellow/40 text-dark border-dark-faded">
              {DESTINATION_BETA_COUNT} beta
            </span>
            <span className="px-3 py-1.5 rounded border bg-bg-blue/40 text-dark border-dark-faded">
              {DESTINATION_COMING_SOON_COUNT} coming soon
            </span>
            <Link
              href="/demo/connections"
              className="px-3 py-1.5 rounded border bg-white text-dark opacity-80 border-dark-faded hover:opacity-100"
            >
              Browse sources →
            </Link>
          </div>
        </div>
      </header>

      <main className="section-space-main" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="max-w-container mx-auto">
            {FAMILY_ORDER.map((family) => {
              const items = grouped[family];
              if (items.length === 0) return null;
              return (
                <section key={family} className="mb-16">
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="font-sans text-fluid-h4 text-dark">
                      {FAMILY_LABELS[family]}
                    </h2>
                    <span className="font-mono text-xs text-dark opacity-40">
                      {items.length} destination{items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="font-sans text-fluid-main text-dark opacity-60 max-w-[56ch] mb-6">
                    {FAMILY_SUBLINES[family]}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((d) => (
                      <Link
                        key={d.id}
                        href={`/destinations/${d.id}`}
                        className={`bg-white border rounded-lg p-5 flex flex-col hover:border-dark transition-colors ${
                          d.status === "live" ? "border-brand/40" : "border-dark-faded"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded flex items-center justify-center font-display text-white text-lg flex-shrink-0"
                            style={{ backgroundColor: d.color }}
                          >
                            {d.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-dark truncate">{d.name}</p>
                            <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5 line-clamp-2">
                              {d.tagline}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-faded gap-2">
                          <span
                            className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${STATUS_STYLES[d.status]}`}
                          >
                            {STATUS_LABELS[d.status]}
                            {d.eta ? ` · ${d.eta}` : ""}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-50">
                            {SYNC_MODE_LABELS[d.syncMode]}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="bg-white border border-dark-faded rounded-lg p-8 mt-10">
              <p className="font-sans text-fluid-h5 text-dark mb-2">
                Need a destination we haven&apos;t built?
              </p>
              <p className="text-dark opacity-60 text-fluid-main mb-5 max-w-2xl">
                The destinations roadmap is driven by what agencies ask for. Tell us where
                your clients want their data — every ask bumps that destination up the queue.
              </p>
              <Link href="/contact" className="btn-secondary inline-flex px-6 py-3">
                Request a destination
              </Link>
            </div>

            <p className="text-center font-mono text-xs uppercase tracking-wider text-dark opacity-40 mt-8">
              {DESTINATION_COUNT} destinations across {FAMILY_ORDER.length} families · more shipping monthly
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </ClientLayout>
  );
}

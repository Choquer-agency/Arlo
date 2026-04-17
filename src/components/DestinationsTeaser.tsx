import Link from "next/link";
import {
  DESTINATION_COUNT,
  DESTINATION_LIVE_COUNT,
  DESTINATION_BETA_COUNT,
} from "@/lib/destinations/catalog";

const TEASER_LOGOS: { id: string; name: string; initial: string; color: string }[] = [
  { id: "looker_studio", name: "Looker Studio", initial: "L", color: "#669DF6" },
  { id: "google_sheets", name: "Google Sheets", initial: "S", color: "#0F9D58" },
  { id: "bigquery", name: "BigQuery", initial: "B", color: "#4285F4" },
  { id: "slack_digest", name: "Slack", initial: "#", color: "#4A154B" },
  { id: "pdf_report", name: "PDF Report", initial: "P", color: "#DC2626" },
];

export function DestinationsTeaser() {
  const ready = DESTINATION_LIVE_COUNT + DESTINATION_BETA_COUNT;

  return (
    <section className="bg-white py-16 md:py-20 border-t border-dark-faded">
      <div className="u-container">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="max-w-xl">
              <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3">
                Destinations · {DESTINATION_COUNT} places your data can live
              </p>
              <h2 className="font-sans font-medium text-fluid-h3 text-dark leading-[1.15] tracking-tight mb-4">
                When Claude isn&apos;t the surface, sync anywhere your client opens.
              </h2>
              <p className="font-sans text-fluid-main text-dark opacity-60 leading-relaxed mb-6">
                {ready} destinations ready today — from Looker Studio dashboards to Slack digests to
                BigQuery loads. Pick the tool the client already uses. ARLO keeps it fresh.
              </p>
              <Link
                href="/destinations"
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
              >
                See all destinations
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M1 7h12M8 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-5 md:justify-end">
              {TEASER_LOGOS.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.id}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-display text-white text-xl border-2 border-transparent group-hover:border-dark transition-colors"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.initial}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-60 group-hover:opacity-100">
                    {d.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

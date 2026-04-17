"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  RotateCw,
  Search,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { usePersona } from "@/lib/usePersona";
import {
  CATALOG_COUNT,
  CATEGORY_LABELS,
  COMING_SOON_COUNT,
  CONNECTOR_CATALOG,
  CatalogEntry,
  ConnectorCategory,
  ConnectorStatus,
  LIVE_COUNT,
  WAITLIST_COUNT,
} from "@/lib/connectors/catalog";
import {
  DESTINATION_CATALOG,
  DESTINATION_COUNT,
  FAMILY_LABELS,
  STATUS_LABELS as DEST_STATUS_LABELS,
  SYNC_MODE_LABELS,
  type DestinationEntry,
  type DestinationFamily,
} from "@/lib/destinations/catalog";

const GOOGLE_DISCOVERED: Record<string, { name: string; id: string }[]> = {
  "GA4 properties": [
    { name: "pennicart.io", id: "properties/438873264" },
    { name: "farnorthcrane.ca", id: "properties/298712451" },
    { name: "pedigreepainting.com", id: "properties/512987334" },
    { name: "+ 44 more", id: "…" },
  ],
  "Search Console sites": [
    { name: "https://pennicart.io/", id: "sc-domain:pennicart.io" },
    { name: "https://farnorthcrane.ca/", id: "sc-domain:farnorthcrane.ca" },
    { name: "+ 50 more", id: "…" },
  ],
  "Google Ads customers": [
    { name: "Northpoint MCC", id: "123-456-7890" },
    { name: "Northpoint Client MCC 2", id: "234-567-8901" },
    { name: "Pedigree Painting Direct", id: "345-678-9012" },
  ],
  "YouTube channels": [
    { name: "Penni Cart", id: "UC_pennicart" },
    { name: "Ahara Med", id: "UC_aharamed" },
    { name: "+ 10 more", id: "…" },
  ],
  "Business Profile locations": [
    { name: "Penni Cart HQ", id: "locations/12345" },
    { name: "+ 17 more", id: "…" },
  ],
};

const SHOPIFY_STORES = [
  { domain: "pennicart.myshopify.com", displayName: "Penni Cart", connectedAt: "Jan 14", mrr: "$42,118" },
  { domain: "selectdecks.myshopify.com", displayName: "Select Decks", connectedAt: "Feb 3", mrr: "$8,847" },
  { domain: "ridgelineroof.myshopify.com", displayName: "Ridgeline Roofing", connectedAt: "Mar 28", mrr: "$2,104" },
];

const STATUS_STYLES: Record<ConnectorStatus, string> = {
  live: "bg-mint text-brand",
  beta: "bg-bg-yellow/50 text-dark",
  coming_soon: "bg-bg-blue/40 text-dark",
  waitlist: "bg-grey text-dark opacity-70",
};

const STATUS_LABEL: Record<ConnectorStatus, string> = {
  live: "Live",
  beta: "Beta",
  coming_soon: "Coming soon",
  waitlist: "Vote",
};

export default function DemoConnectionsPage() {
  const persona = usePersona();
  const [view, setView] = useState<"sources" | "destinations">("sources");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ConnectorCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ConnectorStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [requestOpen, setRequestOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CONNECTOR_CATALOG.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.tagline.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [search, category, statusFilter]);

  const byCategoryEntries = useMemo(() => {
    const grouped: Record<string, CatalogEntry[]> = {};
    for (const c of filtered) {
      (grouped[c.category] ||= []).push(c);
    }
    return grouped;
  }, [filtered]);

  function toggle(id: string) {
    setExpanded(expanded === id ? null : id);
  }
  function submitWaitlist(id: string) {
    if (!waitlistEmail.trim()) return;
    setSubmitted(new Set([...Array.from(submitted), id]));
    setWaitlist(null);
    setWaitlistEmail("");
  }

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Platform connections
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-2">
        {view === "sources"
          ? `${CATALOG_COUNT}+ platforms, one MCP`
          : `${DESTINATION_COUNT} destinations, every client surface`}
      </h1>
      <p className="text-dark opacity-60 text-fluid-main mb-6 max-w-2xl">
        {view === "sources"
          ? "Every platform Claude can query on your behalf. Live ones work today; the rest are on the roadmap — vote with your email on any one to bump it up the queue."
          : "Where ARLO can send the data it pulls — Looker Studio, Sheets, BigQuery, Slack, PDF. Same source-of-truth, every surface your client already opens."}
      </p>

      {/* Sources | Destinations toggle */}
      <div className="inline-flex rounded-lg border border-dark-faded bg-white p-1 mb-8">
        <button
          onClick={() => setView("sources")}
          className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-colors ${
            view === "sources" ? "bg-dark text-white" : "text-dark opacity-60 hover:opacity-100"
          }`}
        >
          Sources ({CATALOG_COUNT})
        </button>
        <button
          onClick={() => setView("destinations")}
          className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-colors ${
            view === "destinations" ? "bg-dark text-white" : "text-dark opacity-60 hover:opacity-100"
          }`}
        >
          Destinations ({DESTINATION_COUNT})
        </button>
      </div>

      {/* Status summary pills (sources view only) */}
      {view === "sources" && (
      <div className="flex flex-wrap gap-3 mb-8 font-mono text-xs uppercase tracking-wider">
        <StatusChip
          label={`${LIVE_COUNT} live now`}
          active={statusFilter === "live"}
          onClick={() => setStatusFilter(statusFilter === "live" ? "all" : "live")}
          tone="mint"
        />
        <StatusChip
          label={`${COMING_SOON_COUNT} coming soon`}
          active={statusFilter === "coming_soon"}
          onClick={() => setStatusFilter(statusFilter === "coming_soon" ? "all" : "coming_soon")}
          tone="blue"
        />
        <StatusChip
          label={`${WAITLIST_COUNT} on roadmap`}
          active={statusFilter === "waitlist"}
          onClick={() => setStatusFilter(statusFilter === "waitlist" ? "all" : "waitlist")}
          tone="grey"
        />
      </div>
      )}

      {/* Search + category filter (sources view only) */}
      {view === "sources" && (
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark opacity-40"
          />
          <input
            type="text"
            placeholder="Search by name, category, or use-case…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-sans text-fluid-main"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ConnectorCategory | "all")}
          className="px-4 py-3 border border-dark-faded rounded bg-white font-sans text-fluid-main focus:outline-none focus:border-brand min-w-[220px]"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      )}

      {/* ── Destinations view: grouped by family ── */}
      {view === "destinations" && <DestinationsView />}

      {/* ── Expanded-management cards for connected providers (Google + Shopify) ── */}
      {view === "sources" && category === "all" && statusFilter === "all" && !search && (
        <section className="mb-10">
          <h2 className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
            Your active connections
          </h2>
          {persona === "solo" ? (
            <SoloActiveConnections />
          ) : (
            <>
              <GoogleCard expanded={expanded === "google"} onToggle={() => toggle("google")} />
              <ShopifyCard expanded={expanded === "shopify"} onToggle={() => toggle("shopify")} />
            </>
          )}
        </section>
      )}

      {/* ── Catalog grouped by category (sources view only) ── */}
      {view === "sources" && (
      Object.keys(byCategoryEntries).length === 0 ? (
        <div className="bg-white border border-dark-faded rounded-lg p-16 text-center">
          <p className="font-sans text-fluid-h4 text-dark mb-2">No connectors match your filters</p>
          <p className="text-dark opacity-60">
            Try clearing the search or picking a different category.
          </p>
        </div>
      ) : (
        Object.entries(byCategoryEntries).map(([cat, items]) => (
          <section key={cat} className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-sans text-fluid-h5 text-dark">
                {CATEGORY_LABELS[cat as ConnectorCategory]}
              </h2>
              <span className="font-mono text-xs text-dark opacity-40">
                {items.length} platform{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((c) => {
                const isLive = c.status === "live";
                const isComingSoon = c.status === "coming_soon";
                const hasSignedUp = submitted.has(c.id);
                const isWaitlistOpen = waitlist === c.id;
                return (
                  <div
                    key={c.id}
                    className={`bg-white border rounded-lg p-5 flex flex-col ${
                      isLive ? "border-brand/30" : "border-dark-faded"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center font-display text-white text-lg flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-dark truncate">{c.name}</p>
                        <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5 line-clamp-2">
                          {c.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-faded gap-2">
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
                          STATUS_STYLES[c.status]
                        }`}
                      >
                        {STATUS_LABEL[c.status]}
                        {c.eta ? ` · ${c.eta}` : ""}
                      </span>
                      <Link
                        href={`/destinations?source=${c.id}`}
                        className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-40 hover:opacity-80 hover:underline"
                        title={`Push ${c.name} to ${DESTINATION_COUNT} destinations`}
                      >
                        → push to {DESTINATION_COUNT}
                      </Link>
                      {isLive ? (
                        <button className="btn-secondary !py-1.5 !px-3 text-[11px]">
                          Connect →
                        </button>
                      ) : hasSignedUp ? (
                        <span className="font-mono text-[11px] text-brand">✓ Added</span>
                      ) : isWaitlistOpen ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="email"
                            placeholder="email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            autoFocus
                            className="px-2 py-1 border border-dark-faded rounded font-sans text-xs w-32 focus:outline-none focus:border-brand"
                          />
                          <button
                            onClick={() => submitWaitlist(c.id)}
                            className="font-mono text-[11px] uppercase tracking-wider text-brand hover:underline"
                          >
                            Go
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setWaitlist(c.id)}
                          className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
                        >
                          {isComingSoon ? "Notify me" : "Vote up"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )
      )}

      {view === "sources" && (
      <div className="bg-white border border-dark-faded rounded-lg p-8 mt-10">
        <p className="font-sans text-fluid-h5 text-dark mb-2">
          Need a specific platform built?
        </p>
        <p className="text-dark opacity-60 text-fluid-main mb-5 max-w-2xl">
          Our roadmap is driven by votes. Tell us what you want connected — every request
          bumps that platform higher in the queue. Enterprise tier lets you buy priority.
        </p>
        <button
          onClick={() => setRequestOpen(true)}
          className="btn-secondary inline-flex px-6 py-3"
        >
          Request a connector
        </button>
      </div>
      )}

      {requestOpen && <RequestConnectorModal onClose={() => setRequestOpen(false)} />}
    </div>
  );
}

// ── Destinations view (grouped by family) ───────────────────────────

const DESTINATION_STATUS_STYLES: Record<DestinationEntry["status"], string> = {
  live: "bg-mint text-brand",
  beta: "bg-bg-yellow/50 text-dark",
  coming_soon: "bg-bg-blue/40 text-dark",
  waitlist: "bg-grey text-dark opacity-70",
};

const FAMILY_ORDER: DestinationFamily[] = ["bi", "spreadsheet", "warehouse", "agency"];

function DestinationsView() {
  const grouped = useMemo(() => {
    const acc: Record<DestinationFamily, DestinationEntry[]> = {
      bi: [],
      spreadsheet: [],
      warehouse: [],
      agency: [],
    };
    for (const d of DESTINATION_CATALOG) acc[d.family].push(d);
    return acc;
  }, []);

  return (
    <>
      {FAMILY_ORDER.map((family) => {
        const items = grouped[family];
        if (items.length === 0) return null;
        return (
          <section key={family} className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-sans text-fluid-h5 text-dark">{FAMILY_LABELS[family]}</h2>
              <span className="font-mono text-xs text-dark opacity-40">
                {items.length} destination{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.id}`}
                  className={`bg-white border rounded-lg p-5 flex flex-col hover:border-dark transition-colors ${
                    d.status === "live" ? "border-brand/30" : "border-dark-faded"
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
                      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${DESTINATION_STATUS_STYLES[d.status]}`}
                    >
                      {DEST_STATUS_LABELS[d.status]}
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
          Want a different destination?
        </p>
        <p className="text-dark opacity-60 text-fluid-main mb-5 max-w-2xl">
          Destinations ship in the order agencies vote for them. Tell us where your
          clients want data delivered and we&apos;ll bump it up the queue.
        </p>
        <Link href="/contact" className="btn-secondary inline-flex px-6 py-3">
          Request a destination
        </Link>
      </div>
    </>
  );
}

function RequestConnectorModal({ onClose }: { onClose: () => void }) {
  const [platform, setPlatform] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const demoName = "Marcus Hale";
  const demoCompany = "Northpoint Digital";
  const demoEmail = "marcus@northpoint.co";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!platform.trim() || !message.trim()) return;
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-dark-faded shadow-2xl w-full max-w-lg p-8"
      >
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="font-sans text-fluid-h4 text-dark">Request a connector</h2>
            <p className="text-dark opacity-60 text-sm mt-1">
              More detail = faster triage. We read every request.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-grey text-dark/60 hover:text-dark flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="py-4">
            <p className="text-dark text-fluid-main mb-2">Got it, {demoName.split(" ")[0]}.</p>
            <p className="text-dark opacity-60 mb-6">
              We&apos;ll reply to {demoEmail} once we&apos;ve had a chance to scope it.
            </p>
            <button onClick={onClose} className="btn-secondary px-5 py-2">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={demoName}
                  readOnly
                  className="w-full px-3 py-2.5 border border-dark-faded rounded bg-grey font-sans text-dark/70"
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={demoCompany}
                  readOnly
                  className="w-full px-3 py-2.5 border border-dark-faded rounded bg-grey font-sans text-dark/70"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                Platform you want
              </label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. Klaviyo, HubSpot, Typeform…"
                className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-sans focus:outline-none focus:border-brand"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                What do you need from it?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Which data, which tools, how urgently. More = better."
                className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-sans focus:outline-none focus:border-brand"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn px-5 py-2">
                Cancel
              </button>
              <button type="submit" className="btn-secondary px-5 py-2">
                Send request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────

function StatusChip({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone: "mint" | "blue" | "grey";
}) {
  const tones = {
    mint: active ? "bg-brand text-white border-brand" : "bg-mint text-brand border-brand-neon/40",
    blue: active ? "bg-brand text-white border-brand" : "bg-bg-blue/40 text-dark border-dark-faded",
    grey: active ? "bg-dark text-white border-dark" : "bg-white text-dark opacity-80 border-dark-faded",
  };
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded border ${tones[tone]} hover:opacity-90`}
    >
      {label}
    </button>
  );
}

function GoogleCard({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white border border-brand/30 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-grey text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white border border-dark-faded rounded flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
          </div>
          <div>
            <h3 className="font-sans text-fluid-h5 text-dark">
              Google <span className="text-dark opacity-50 text-fluid-small font-mono">· 5 surfaces</span>
            </h3>
            <p className="font-mono text-xs text-dark opacity-60 mt-0.5">
              Connected as marcus@northpoint.co · 132 accounts discovered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-wider text-brand bg-mint px-3 py-1 rounded">
            Live
          </span>
          {expanded ? <ChevronUp size={18} className="text-dark opacity-60" /> : <ChevronDown size={18} className="text-dark opacity-60" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dark-faded">
          <div className="px-6 py-5 bg-grey grid grid-cols-5 gap-4 text-center border-b border-dark-faded">
            <GStat value={47} label="GA4" />
            <GStat value={52} label="GSC" />
            <GStat value={3} label="Ads" />
            <GStat value={12} label="YouTube" />
            <GStat value={18} label="GBP" />
          </div>
          <div className="px-6 py-5">
            <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
              Accounts discovered via OAuth
            </p>
            <div className="space-y-3 mb-5">
              {Object.entries(GOOGLE_DISCOVERED).map(([platform, accounts]) => (
                <div key={platform}>
                  <p className="font-mono text-xs text-dark mb-1.5">{platform}</p>
                  <div className="space-y-1">
                    {accounts.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between px-3 py-1.5 bg-grey rounded text-sm"
                      >
                        <span className="text-dark">{a.name}</span>
                        <span className="font-mono text-xs text-dark opacity-40">{a.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-md bg-mint border border-brand-neon/30 p-4 mb-4">
              <p className="text-dark text-sm">
                ARLO only sees accounts Google has granted to{" "}
                <span className="font-mono">marcus@northpoint.co</span>. New GA4 property?
                Have the client grant access, then <b>Refresh accounts</b>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-dark-faded rounded font-mono text-[11px] uppercase tracking-wider text-dark hover:bg-grey">
                <RotateCw size={12} /> Refresh
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-dark-faded rounded font-mono text-[11px] uppercase tracking-wider text-dark hover:bg-grey">
                <ExternalLink size={12} /> Different Google account
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-bg-red/30 text-bg-red rounded font-mono text-[11px] uppercase tracking-wider hover:bg-bg-red/10 ml-auto">
                <Trash2 size={12} /> Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopifyCard({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white border border-bg-yellow rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-grey text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-bg-orange rounded flex items-center justify-center font-display text-bg-dark text-lg">
            S
          </div>
          <div>
            <h3 className="font-sans text-fluid-h5 text-dark">
              Shopify <span className="text-dark opacity-50 text-fluid-small font-mono">· per-store OAuth</span>
            </h3>
            <p className="font-mono text-xs text-dark opacity-60 mt-0.5">
              {SHOPIFY_STORES.length} stores linked · Beta
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-wider text-dark bg-bg-yellow/50 px-3 py-1 rounded">
            Beta · {SHOPIFY_STORES.length}
          </span>
          {expanded ? <ChevronUp size={18} className="text-dark opacity-60" /> : <ChevronDown size={18} className="text-dark opacity-60" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-dark-faded px-6 py-5">
          <div className="space-y-2 mb-4">
            {SHOPIFY_STORES.map((s) => (
              <div
                key={s.domain}
                className="flex items-center justify-between px-4 py-3 bg-grey rounded border border-dark-faded"
              >
                <div>
                  <p className="font-sans text-dark text-sm">{s.displayName}</p>
                  <p className="font-mono text-xs text-dark opacity-60 mt-0.5">{s.domain}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase text-dark opacity-60">MRR</p>
                    <p className="font-mono text-sm text-dark">{s.mrr}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="font-mono text-[10px] uppercase text-dark opacity-60">Since</p>
                    <p className="font-mono text-sm text-dark">{s.connectedAt}</p>
                  </div>
                  <button className="text-bg-red hover:bg-bg-red/10 p-1.5 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded font-mono text-xs uppercase tracking-wider hover:opacity-90">
            <Plus size={14} /> Connect another Shopify store
          </button>
        </div>
      )}
    </div>
  );
}

function GStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-sans text-fluid-h4 text-dark">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-60 mt-0.5">
        {label}
      </p>
    </div>
  );
}

// Solo persona: Tessellate Coffee has ONE account per platform — show them as
// simple rows instead of agency's "Google · 132 accounts discovered" card.
const SOLO_ACTIVE: { id: string; platform: string; color: string; account: string; detail: string }[] = [
  { id: "ga4", platform: "Google Analytics 4", color: "#E37400", account: "tessellatecoffee.io", detail: "properties/438873264" },
  { id: "gsc", platform: "Search Console", color: "#4285F4", account: "https://tessellatecoffee.io/", detail: "sc-domain:tessellatecoffee.io" },
  { id: "google_ads", platform: "Google Ads", color: "#4285F4", account: "Tessellate Coffee · Brand + Search", detail: "123-456-7890" },
  { id: "youtube", platform: "YouTube", color: "#FF0000", account: "Tessellate Coffee", detail: "UC_tessellate" },
  { id: "gbp", platform: "Google Business Profile", color: "#34A853", account: "Tessellate Coffee · 2 locations", detail: "locations/12345, locations/12346" },
  { id: "shopify", platform: "Shopify", color: "#96BF48", account: "tessellate.myshopify.com", detail: "Beta · live orders" },
];

function SoloActiveConnections() {
  return (
    <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
      {SOLO_ACTIVE.map((c, i) => (
        <div
          key={c.id}
          className={`flex items-center gap-4 p-5 ${
            i !== SOLO_ACTIVE.length - 1 ? "border-b border-dark-faded" : ""
          }`}
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center font-display text-white shrink-0"
            style={{ backgroundColor: c.color }}
          >
            {c.platform.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-dark">{c.platform}</p>
            <p className="font-mono text-xs text-dark opacity-60 mt-0.5 truncate">
              {c.account}
              <span className="text-dark/30"> · {c.detail}</span>
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-brand bg-mint px-2 py-1 rounded shrink-0 inline-flex items-center gap-1">
            <Check size={10} />
            Connected
          </span>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border border-dark-faded rounded font-mono text-[11px] uppercase tracking-wider text-dark hover:bg-grey shrink-0"
            title="Refresh this connection"
          >
            <RotateCw size={12} /> Refresh
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border border-bg-red/30 text-bg-red rounded font-mono text-[11px] uppercase tracking-wider hover:bg-bg-red/10 shrink-0"
            title="Disconnect"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, X, AlertTriangle, Search, Copy, RotateCw, Check, MessageSquare, PlayCircle, Pause, Trash2, ChevronDown } from "lucide-react";
import { CONNECTOR_CATALOG } from "@/lib/connectors/catalog";
import {
  DESTINATION_CATALOG,
  STATUS_LABELS as DEST_STATUS_LABELS,
  SYNC_MODE_LABELS,
  findDestination,
} from "@/lib/destinations/catalog";

const CLIENT_NAME = "Penni Cart";

const PLATFORMS = [
  { key: "ga4", label: "GA4 property", value: "properties/438873264", status: "connected" },
  { key: "gsc", label: "Search Console site", value: "https://pennicart.io/", status: "connected" },
  { key: "ads", label: "Google Ads customer", value: "123-456-7890", status: "connected" },
  { key: "youtube", label: "YouTube channel", value: "UC_pennicart", status: "connected" },
  { key: "gbp", label: "Business Profile", value: "—", status: "not-assigned" },
  { key: "psi", label: "PageSpeed (auto from GSC)", value: "Inherited from GSC", status: "auto" },
  { key: "meta", label: "Meta Ads account", value: "—", status: "not-assigned" },
  { key: "shopify", label: "Shopify store", value: "pennicart.myshopify.com", status: "connected" },
];

export default function DemoClientDetailPage() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="max-w-container mx-auto">
      <Link
        href="/demo/clients"
        className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100 mb-4 inline-block no-underline"
      >
        ← All clients
      </Link>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h1 className="font-sans text-fluid-h2 text-dark">{CLIENT_NAME}</h1>
          <p className="font-mono text-sm text-dark opacity-60">pennicart.io</p>
        </div>
        <button
          onClick={() => setConnectOpen(true)}
          className="btn-secondary text-base px-5 py-2.5 inline-flex items-center gap-2"
        >
          <Plus size={16} /> Connect more
        </button>
      </div>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <h2 className="font-sans text-fluid-h4 text-dark mb-1">Platform assignments</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
          Pick from your workspace Google OAuth
        </p>
        <div className="space-y-3">
          {PLATFORMS.map((p) => (
            <div key={p.key} className="flex items-center justify-between py-3 border-b border-dark-faded last:border-0">
              <div>
                <p className="font-sans text-fluid-main text-dark">{p.label}</p>
                <p className="font-mono text-xs text-dark opacity-60 mt-0.5">{p.value}</p>
              </div>
              <span
                className={`font-mono text-xs uppercase tracking-wider px-3 py-1 rounded ${
                  p.status === "connected"
                    ? "bg-mint text-brand"
                    : p.status === "auto"
                    ? "bg-grey text-dark opacity-60"
                    : "border border-dark-faded text-dark opacity-40"
                }`}
              >
                {p.status === "connected" ? "Connected" : p.status === "auto" ? "Auto" : "Not assigned"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <h2 className="font-sans text-fluid-h4 text-dark mb-1">Recent MCP queries on {CLIENT_NAME}</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
          Last 10 tool calls
        </p>
        <div className="space-y-3">
          {[
            { t: "2m ago", who: "priya@northpoint.co", tool: "marketing_query", ms: 1240, prompt: "Last 28 days GSC" },
            { t: "41m ago", who: "jordan@northpoint.co", tool: "marketing_query", ms: 1104, prompt: "Top 10 queries Nov" },
            { t: "3h ago", who: "marcus@northpoint.co", tool: "marketing_compare", ms: 2201, prompt: "Nov vs Oct GA4 sessions" },
            { t: "yesterday", who: "priya@northpoint.co", tool: "marketing_insights", ms: 4812, prompt: "What changed this week?" },
            { t: "2d ago", who: "marcus@northpoint.co", tool: "marketing_report", ms: 3109, prompt: "Monthly report Oct" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-dark-faded last:border-0">
              <div>
                <p className="font-mono text-sm text-brand">{r.tool}</p>
                <p className="text-dark text-fluid-small opacity-60 mt-0.5">&quot;{r.prompt}&quot;</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-dark opacity-60">{r.who}</p>
                <p className="font-mono text-xs text-dark opacity-40 mt-0.5">{r.t} · {r.ms}ms</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ClientDestinationsDemo clientName={CLIENT_NAME} />

      <ClientMcpSection clientName={CLIENT_NAME} />

      <ClientActivitySection clientName={CLIENT_NAME} />

      <section className="bg-white border border-bg-red/30 rounded-lg p-8">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-bg-red mt-1" size={20} />
          <div>
            <h2 className="font-sans text-fluid-h4 text-dark">Danger zone</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-1">
              Irreversible actions for this client
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-t border-dark-faded">
          <div>
            <p className="text-dark font-sans">Archive client</p>
            <p className="text-dark opacity-60 text-sm mt-0.5">Hides the client from lists and disables queries. Reversible.</p>
          </div>
          <button className="btn px-5 py-2 shrink-0">Archive</button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-t border-dark-faded">
          <div>
            <p className="text-dark font-sans">Delete client</p>
            <p className="text-dark opacity-60 text-sm mt-0.5">Permanently removes the client and all query history. Cannot be undone.</p>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center justify-center font-sans font-medium px-5 py-2 rounded-sm bg-bg-red/10 text-bg-red border border-bg-red/30 hover:bg-bg-red hover:text-white transition-colors shrink-0"
          >
            Delete client
          </button>
        </div>
      </section>

      {connectOpen && (
        <ConnectMoreModal clientName={CLIENT_NAME} onClose={() => setConnectOpen(false)} />
      )}
      {deleteOpen && (
        <DeleteClientModal clientName={CLIENT_NAME} onClose={() => setDeleteOpen(false)} />
      )}
    </div>
  );
}

function ClientDestinationsDemo({ clientName }: { clientName: string }) {
  const destinations = useMemo(
    () => [
      {
        id: "mock-slack",
        kind: "slack_digest",
        name: `Slack · #${clientName.toLowerCase().replace(/\s+/g, "-")}-performance`,
        lastRunAt: "2m ago",
        schedule: "daily",
      },
      {
        id: "mock-email",
        kind: "email_digest",
        name: `Weekly email to ceo@${clientName.toLowerCase().replace(/\s+/g, "")}.com`,
        lastRunAt: "3h ago",
        schedule: "weekly",
      },
      {
        id: "mock-looker",
        kind: "looker_studio",
        name: `${clientName} · performance dashboard`,
        lastRunAt: "live",
        schedule: "live",
      },
      {
        id: "mock-share",
        kind: "shareable_dashboard",
        name: `Share link · expires Dec 31`,
        lastRunAt: "live",
        schedule: "live",
      },
    ],
    [clientName]
  );
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-sans text-fluid-h4 text-dark">Destinations</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-1">
            Where {clientName}&apos;s numbers get delivered
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2"
        >
          <Plus size={14} /> Add destination
        </button>
      </div>
      <div className="space-y-2">
        {destinations.map((d) => {
          const catalog = findDestination(d.kind);
          return (
            <div
              key={d.id}
              className="flex items-center justify-between border border-dark-faded rounded-lg p-4 gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded flex items-center justify-center font-display text-white shrink-0"
                  style={{ backgroundColor: catalog?.color ?? "#4A154B" }}
                >
                  {(catalog?.name ?? d.kind).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-dark text-sm truncate">{d.name}</p>
                  <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5 truncate">
                    {catalog?.name ?? d.kind} · {d.schedule} · last {d.lastRunAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-mint text-brand">
                  active
                </span>
                <button className="p-2 border border-dark-faded rounded hover:bg-grey" title="Run now">
                  <PlayCircle size={14} />
                </button>
                <button className="p-2 border border-dark-faded rounded hover:bg-grey" title="Pause">
                  <Pause size={14} />
                </button>
                <button className="p-2 border border-dark-faded rounded hover:bg-grey" title="History">
                  <ChevronDown size={14} />
                </button>
                <button className="p-2 border border-bg-red/30 text-bg-red rounded" title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {addOpen && <AddDestinationDemoModal clientName={clientName} onClose={() => setAddOpen(false)} />}
    </section>
  );
}

function AddDestinationDemoModal({
  clientName,
  onClose,
}: {
  clientName: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = useMemo(
    () => DESTINATION_CATALOG.filter((d) => d.status !== "waitlist"),
    []
  );

  return (
    <ModalShell
      onClose={onClose}
      title={`Add destination · ${clientName}`}
      subtitle="Pick where this client's data should be delivered"
    >
      {!selected ? (
        <div className="max-h-[60vh] overflow-auto space-y-2">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className="w-full flex items-center gap-3 p-3 border border-dark-faded rounded-lg hover:border-brand hover:bg-grey text-left"
            >
              <div
                className="w-9 h-9 rounded flex items-center justify-center font-display text-white shrink-0"
                style={{ backgroundColor: d.color }}
              >
                {d.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-dark truncate">{d.name}</p>
                <p className="font-mono text-[11px] text-dark opacity-60 truncate">
                  {d.tagline}
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-50 shrink-0">
                {SYNC_MODE_LABELS[d.syncMode]} · {DEST_STATUS_LABELS[d.status]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-dark text-fluid-main mb-4">
            Next step: connect {filtered.find((d) => d.id === selected)?.name} for {clientName}.
          </p>
          <p className="text-dark opacity-60 text-sm mb-6">
            In the live product this opens the destination wizard — auth, source
            picker, schedule. For the demo, we stop here.
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => setSelected(null)}
              className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
            >
              ← Pick a different destination
            </button>
            <button onClick={onClose} className="btn-secondary px-5 py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function ClientMcpSection({ clientName }: { clientName: string }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const url = `https://askarlo.app/api/mcp/client/penni-cart?token=cl_${clientName
    .toLowerCase()
    .replace(/\s+/g, "-")}_8f3c2b9e4d1a7h6k`;

  const instructions = `Hi — we've set up Claude access for your ${clientName} analytics so you can ask questions directly.

To connect:

1. Open Claude Desktop → Settings → Connectors → Add custom connector
2. Name it "Arlo" and paste this URL: ${url}
3. Leave the OAuth fields blank
4. Start a new chat and try one of the questions below.

IMPORTANT: start every question with "Using Arlo —" so Claude knows to pull from your live data instead of guessing. Example:

    Using Arlo — how's my traffic looking this month?

Questions you can ask:

• Using Arlo — how's my traffic looking this month?
• Using Arlo — which pages drove the most conversions last week?
• Using Arlo — compare my paid search performance to last quarter.
• Using Arlo — what search terms are people finding my site with?
• Using Arlo — did my Google Ads spend actually drive sales?
• Using Arlo — why did my traffic change this week?
• Using Arlo — give me a quick weekly summary.

Claude pulls directly from your live data (traffic, search, conversions, ads) so the answers are based on what's actually happening right now — no stale reports.

Any questions, just reply and we'll help.`;

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  }

  async function copyInstructions() {
    await navigator.clipboard.writeText(instructions);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 1500);
  }

  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
      <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
        <div>
          <h2 className="font-sans text-fluid-h4 text-dark">
            Let {clientName} ask Claude about their own data
          </h2>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-1">
            Client MCP URL · scoped to {clientName} only
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-brand-lime bg-dark px-2 py-1 rounded shrink-0">
          New
        </span>
      </div>

      <p className="text-dark opacity-70 text-sm mt-4 mb-5 max-w-2xl">
        Share this URL with {clientName}. When they paste it into Claude Desktop, they
        can ask Claude about <span className="text-dark font-medium">their own</span> traffic,
        conversions, and ad performance — scoped to their data only.
      </p>

      <div className="bg-brand-lime rounded-lg p-5 mb-6">
        <div className="bg-dark rounded-md p-4 font-mono text-xs break-all text-brand-lime mb-4">
          {url}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyUrl}
            className="flex items-center gap-2 bg-dark text-brand-lime px-4 py-2 font-mono text-xs uppercase tracking-wider rounded hover:opacity-90"
          >
            {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
            {copiedUrl ? "Copied" : "Copy URL"}
          </button>
          <button
            onClick={copyInstructions}
            className="flex items-center gap-2 border border-dark/20 text-dark px-4 py-2 font-mono text-xs uppercase tracking-wider rounded hover:bg-dark/5"
          >
            {copiedInstructions ? <Check size={14} /> : <Copy size={14} />}
            {copiedInstructions ? "Copied" : "Copy setup instructions"}
          </button>
          <button className="flex items-center gap-2 border border-dark/20 text-dark px-4 py-2 font-mono text-xs uppercase tracking-wider rounded hover:bg-dark/5">
            <RotateCw size={14} />
            Rotate token
          </button>
        </div>
      </div>

      <div className="border-t border-dark-faded pt-5">
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
          What {clientName} will be able to ask
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "how's my traffic looking this month?",
            "which pages drove the most conversions last week?",
            "compare my paid search performance to last quarter.",
            "what search terms are people finding my site with?",
          ].map((q) => (
            <div
              key={q}
              className="flex items-start gap-2 px-3 py-2 bg-grey rounded text-sm text-dark/80"
            >
              <MessageSquare size={14} className="text-dark/40 mt-0.5 shrink-0" />
              <span>
                <span className="text-brand font-medium">Using Arlo —</span> {q}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientActivitySection({ clientName }: { clientName: string }) {
  const stats = [
    { label: "Queries this month", value: "42" },
    { label: "Last query", value: "2h ago" },
    { label: "Unique questions", value: "28" },
    { label: "Avg / week", value: "11" },
  ];

  const topics = [
    { topic: "Traffic & sessions", calls: 14 },
    { topic: "Conversions & revenue", calls: 9 },
    { topic: "Paid search performance", calls: 8 },
    { topic: "Search Console / SEO", calls: 7 },
    { topic: "Social / Meta Ads", calls: 4 },
  ];

  const maxCalls = topics[0].calls;

  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
      <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
        <div>
          <h2 className="font-sans text-fluid-h4 text-dark">Client-side activity</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-1">
            What {clientName} has been asking Claude
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-grey rounded-lg p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-60 mb-1">
              {s.label}
            </p>
            <p className="font-sans text-fluid-h5 text-dark">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-4">
          Top topics
        </p>
        <div className="space-y-3">
          {topics.map((t) => (
            <div key={t.topic}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-dark">{t.topic}</span>
                <span className="font-mono text-xs text-dark opacity-60">{t.calls}</span>
              </div>
              <div className="h-2 bg-grey rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-lime"
                  style={{ width: `${(t.calls / maxCalls) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConnectMoreModal({ clientName, onClose }: { clientName: string; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const available = useMemo(
    () => CONNECTOR_CATALOG.filter((c) => c.status === "live" || c.status === "beta"),
    []
  );

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return available;
    return available.filter((c) => {
      const haystack = `${c.name} ${c.tagline} ${c.category}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [available, query]);

  const showSearch = available.length >= 6;

  return (
    <ModalShell onClose={onClose} title={`Connect more to ${clientName}`} subtitle="Pick a platform to wire up for this client">
      {!selected ? (
        <>
          {showSearch && (
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"
              />
              <input
                type="text"
                autoFocus
                placeholder="Search platforms…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-sans"
              />
            </div>
          )}
          <div className="max-h-[55vh] overflow-y-auto pr-1 -mr-1">
            {filtered.length === 0 ? (
              <p className="text-dark/60 text-center py-10">No platforms match &quot;{query}&quot;.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className="flex items-center gap-3 p-3 border border-dark-faded rounded-lg hover:border-brand hover:bg-grey text-left transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded flex items-center justify-center font-display text-white text-base shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-dark truncate">{c.name}</p>
                      <p className="font-mono text-[11px] text-dark opacity-60 truncate">{c.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <p className="text-dark text-fluid-main mb-4">
            Next step: authorize {available.find((c) => c.id === selected)?.name} for {clientName}.
          </p>
          <p className="text-dark opacity-60 text-sm mb-6">
            In the live product this opens the OAuth or API-key flow specific to that platform.
            For the demo, we&apos;ll stop here.
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => setSelected(null)}
              className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
            >
              ← Pick a different platform
            </button>
            <button onClick={onClose} className="btn-secondary px-5 py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function DeleteClientModal({ clientName, onClose }: { clientName: string; onClose: () => void }) {
  const [nameInput, setNameInput] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const ready = nameInput === clientName && confirmInput.toLowerCase() === "delete";

  return (
    <ModalShell
      onClose={onClose}
      title="Delete client?"
      subtitle="This cannot be undone. To confirm, type the client name and the word delete."
    >
      <div className="space-y-4 mb-6">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
            Client name: <span className="text-dark">{clientName}</span>
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={clientName}
            className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-bg-red font-sans"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
            Type <span className="font-mono text-bg-red">delete</span> to confirm
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="delete"
            className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-bg-red font-sans"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn px-5 py-2">
          Cancel
        </button>
        <button
          disabled={!ready}
          onClick={onClose}
          className={`inline-flex items-center justify-center font-sans font-medium px-5 py-2 rounded-sm transition-colors ${
            ready
              ? "bg-bg-red text-white hover:opacity-90"
              : "bg-bg-red/30 text-white/70 cursor-not-allowed"
          }`}
        >
          Delete client
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-dark-faded shadow-2xl w-full max-w-xl max-h-[85vh] overflow-auto p-8"
      >
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="font-sans text-fluid-h4 text-dark">{title}</h2>
            {subtitle && <p className="text-dark opacity-60 text-sm mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-grey text-dark/60 hover:text-dark flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

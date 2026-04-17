"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Copy, RotateCw, Shield, Search, Check } from "lucide-react";
import { DEMO_CLIENTS } from "@/lib/demoClients";
import { usePersona } from "@/lib/usePersona";

const TEAM = {
  marcus: { name: "Marcus Hale", email: "marcus@northpoint.co", role: "owner", lastActive: "2m ago", joined: "Jan 8, 2024", clients: 47, queries: 412 },
  priya: { name: "Priya Sundaram", email: "priya@northpoint.co", role: "admin", lastActive: "2m ago", joined: "Feb 12, 2024", clients: 47, queries: 891 },
  jordan: { name: "Jordan Flores", email: "jordan@northpoint.co", role: "admin", lastActive: "14m ago", joined: "Mar 4, 2024", clients: 47, queries: 623 },
  devin: { name: "Devin Park", email: "devin@northpoint.co", role: "member", lastActive: "1h ago", joined: "May 18, 2024", clients: 8, queries: 214 },
  sam: { name: "Sam Wexler", email: "sam@northpoint.co", role: "member", lastActive: "3h ago", joined: "Jun 22, 2024", clients: 6, queries: 129 },
  amelia: { name: "Amelia Finch", email: "amelia@northpoint.co", role: "member", lastActive: "yesterday", joined: "Aug 2, 2024", clients: 5, queries: 87 },
  ken: { name: "Ken Orozco", email: "ken@northpoint.co", role: "member", lastActive: "2 days ago", joined: "Sep 14, 2024", clients: 4, queries: 41 },
  lisa: { name: "Lisa Tran", email: "lisa@northpoint.co", role: "member", lastActive: "never", joined: "Apr 1, 2026", clients: 0, queries: 0 },
  alex: { name: "Alex Rivera", email: "alex@tessellatecoffee.io", role: "owner", lastActive: "just now", joined: "Mar 12, 2025", clients: 1, queries: 214 },
} as const;

const RECENT_QUERIES_AGENCY = [
  { t: "2m ago", tool: "marketing_query", client: "Penni Cart", ms: 1240 },
  { t: "41m ago", tool: "marketing_query", client: "Penni Cart", ms: 1104 },
  { t: "3h ago", tool: "marketing_compare", client: "Far North Crane", ms: 2201 },
  { t: "yesterday", tool: "marketing_insights", client: "Pedigree Painting", ms: 4812 },
];

const RECENT_QUERIES_SOLO = [
  { t: "just now", tool: "marketing_query", client: "Tessellate Coffee", ms: 980 },
  { t: "1h ago", tool: "marketing_compare", client: "Tessellate Coffee", ms: 1812 },
  { t: "yesterday", tool: "marketing_attribution", client: "Tessellate Coffee", ms: 2104 },
  { t: "2d ago", tool: "check_platform_health", client: "Tessellate Coffee", ms: 412 },
];

export default function DemoTeamMemberPage() {
  const { id } = useParams<{ id: string }>();
  const member = TEAM[id as keyof typeof TEAM];
  const persona = usePersona();
  if (!member) notFound();

  const memberMcpUrl = `https://askarlo.app/api/mcp?token=ak_${id}_8f3c2b9e4d1a7h6k5m9n2p8q3r5t7v1`;

  return (
    <div className="max-w-container mx-auto">
      <Link
        href="/demo/team"
        className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100 mb-4 inline-block no-underline"
      >
        ← All team members
      </Link>

      <div className="flex items-start justify-between mb-10 gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-dark text-brand-lime flex items-center justify-center font-display text-xl">
            {member.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="font-sans text-fluid-h2 text-dark">{member.name}</h1>
            <p className="font-mono text-sm text-dark opacity-60 mt-1">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded ${
              member.role === "owner"
                ? "bg-brand-neon text-dark"
                : member.role === "admin"
                ? "bg-mint text-brand"
                : "bg-grey text-dark"
            }`}
          >
            {member.role}
          </span>
          <button className="btn px-4 py-2 text-sm">Change role</button>
          <button className="btn px-4 py-2 text-sm">Remove</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Last active" value={member.lastActive} />
        <Stat label="Joined" value={member.joined} />
        <Stat
          label={persona === "solo" ? "Access" : "Clients access"}
          value={persona === "solo" ? "Full" : String(member.clients)}
        />
        <Stat label="Queries this month" value={member.queries.toLocaleString()} />
      </div>

      {persona === "solo" ? (
        <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={18} className="text-brand" />
            <h2 className="font-sans text-fluid-h4 text-dark">Full access</h2>
          </div>
          <p className="text-dark/70 text-fluid-main max-w-2xl">
            Every teammate on the Solo plan has the same access as the owner — every
            source, every connection, every prompt.
          </p>
        </section>
      ) : (
        <ClientAccessSection member={member} />
      )}



      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
          <h2 className="font-sans text-fluid-h4 text-dark">Personal MCP URL</h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-dark/60 bg-grey px-2 py-1 rounded">
            coming soon
          </span>
        </div>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-5">
          {persona === "solo"
            ? "Each teammate gets their own URL for Tessellate Coffee"
            : "Each member gets their own URL, scoped to their clients"}
        </p>
        <div className="bg-dark rounded-md p-4 font-mono text-xs break-all text-brand-lime mb-4">
          {memberMcpUrl}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 btn-secondary px-5 py-2 text-sm">
            <Copy size={14} /> Copy URL
          </button>
          <button className="flex items-center gap-2 btn px-5 py-2 text-sm">
            <RotateCw size={14} /> Rotate token
          </button>
        </div>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8">
        <h2 className="font-sans text-fluid-h4 text-dark mb-1">Recent MCP queries</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
          Last tool calls by {member.name.split(" ")[0]}
        </p>
        {member.queries === 0 ? (
          <p className="text-dark opacity-60 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {(persona === "solo" ? RECENT_QUERIES_SOLO : RECENT_QUERIES_AGENCY).map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-dark-faded last:border-0">
                <div>
                  <p className="font-mono text-sm text-brand">{r.tool}</p>
                  <p className="text-dark text-fluid-small opacity-60 mt-0.5">on {r.client}</p>
                </div>
                <p className="font-mono text-xs text-dark opacity-40">{r.t} · {r.ms}ms</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClientAccessSection({
  member,
}: {
  member: { name: string; role: string; clients: number };
}) {
  const firstName = member.name.split(" ")[0];
  const [mode, setMode] = useState<"all" | "scoped">(
    member.role === "owner" || member.role === "admin" || member.clients >= DEMO_CLIENTS.length
      ? "all"
      : "scoped"
  );
  const initial = useMemo(
    () =>
      mode === "all"
        ? new Set(DEMO_CLIENTS.map((c) => c.id))
        : new Set(DEMO_CLIENTS.slice(0, Math.max(0, Math.min(member.clients, DEMO_CLIENTS.length))).map((c) => c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [selected, setSelected] = useState<Set<string>>(initial);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEMO_CLIENTS;
    return DEMO_CLIENTS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
    );
  }, [query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
      <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
        <div>
          <h2 className="font-sans text-fluid-h4 text-dark">Client access</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-1">
            Which clients {firstName} can query
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-dark-faded p-1 bg-grey">
          <button
            onClick={() => setMode("all")}
            className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-colors ${
              mode === "all" ? "bg-dark text-brand-lime" : "text-dark/60 hover:text-dark"
            }`}
          >
            All clients
          </button>
          <button
            onClick={() => setMode("scoped")}
            className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-colors ${
              mode === "scoped" ? "bg-dark text-brand-lime" : "text-dark/60 hover:text-dark"
            }`}
          >
            Specific clients
          </button>
        </div>
      </div>

      {mode === "all" ? (
        <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-mint border border-brand-neon/30 rounded-md">
          <Shield size={16} className="text-brand" />
          <p className="text-dark">
            {firstName} can query all {DEMO_CLIENTS.length} clients
            {member.role === "owner" || member.role === "admin"
              ? ` — inherited from ${member.role} role.`
              : "."}
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <p className="text-dark opacity-70 text-sm">
              {selected.size} of {DEMO_CLIENTS.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set(DEMO_CLIENTS.map((c) => c.id)))}
                className="font-mono text-[11px] uppercase tracking-wider text-dark/60 hover:text-dark"
              >
                Select all
              </button>
              <span className="text-dark/30">·</span>
              <button
                onClick={() => setSelected(new Set())}
                className="font-mono text-[11px] uppercase tracking-wider text-dark/60 hover:text-dark"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"
            />
            <input
              type="text"
              placeholder="Search clients…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-sans text-sm"
            />
          </div>

          <div className="max-h-72 overflow-y-auto border border-dark-faded rounded-md divide-y divide-dark-faded">
            {filtered.length === 0 ? (
              <p className="text-dark/60 text-center py-8 text-sm">No clients match &quot;{query}&quot;.</p>
            ) : (
              filtered.map((c) => {
                const on = selected.has(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-grey cursor-pointer"
                  >
                    <span
                      className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border transition-colors ${
                        on ? "bg-brand-lime border-brand-lime text-brand" : "border-dark-faded bg-white"
                      }`}
                    >
                      {on && <Check size={12} />}
                    </span>
                    <p className="text-dark text-sm font-sans truncate">{c.name}</p>
                    <p className="font-mono text-[11px] text-dark/60 truncate">{c.url}</p>
                    <span className="flex-1" />
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => toggle(c.id)}
                    />
                  </label>
                );
              })
            )}
          </div>

          <div className="mt-4 flex justify-start gap-3">
            <button className="btn-secondary px-4 py-2 text-sm">Save access</button>
            <button onClick={() => setSelected(initial)} className="btn px-4 py-2 text-sm">
              Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-dark-faded rounded-lg p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-1">{label}</p>
      <p className="font-sans text-fluid-h5 text-dark">{value}</p>
    </div>
  );
}

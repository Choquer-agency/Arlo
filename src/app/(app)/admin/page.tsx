"use client";

import { useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getPlan } from "@/lib/billing";
import { ShieldAlert, Search, UserPlus, Copy, Check } from "lucide-react";

type Row = {
  _id: Id<"workspaces">;
  name: string;
  workspaceType: string;
  plan: string;
  trialEndsAt: string | null;
  createdAt: string;
  managedByAgency: boolean;
  ownerEmail: string | null;
  ownerName: string | null;
  memberCount: number;
  clientCount: number;
  websites: string[];
  liveSources: number;
  googleConnected: boolean;
  lastMcpUsedAt: string | null;
};

const NOW = () => Date.now();

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - NOW()) / (24 * 60 * 60 * 1000));
}

function monthsSince(iso: string): number {
  return Math.max(1, Math.round((NOW() - new Date(iso).getTime()) / (30 * 24 * 60 * 60 * 1000)));
}

/** MRR + a rough LTV estimate (plan price × months active). Real Stripe LTV can slot in later. */
function economics(plan: string, createdAt: string) {
  const price = getPlan(plan).price;
  const mrr = Number(price.replace(/[^0-9.]/g, "")) || 0;
  const ltv = mrr * monthsSince(createdAt);
  return { mrr, ltv };
}

export default function AdminPage() {
  const isAdmin = useQuery(api.admin.amISuperAdmin);
  const rows = useQuery(api.admin.listWorkspaces, isAdmin ? {} : "skip") as Row[] | undefined;
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Id<"workspaces"> | null>(null);
  const [provisioning, setProvisioning] = useState(false);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = q.trim().toLowerCase();
    const list = needle
      ? rows.filter((r) =>
          [r.name, r.ownerEmail, ...r.websites].join(" ").toLowerCase().includes(needle)
        )
      : rows;
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [rows, q]);

  if (isAdmin === undefined) return <div className="p-8 text-dark/40">Loading…</div>;
  if (!isAdmin) {
    return (
      <div className="max-w-container mx-auto">
        <div className="bg-white border border-dark-faded rounded-lg p-12 text-center">
          <ShieldAlert className="mx-auto mb-4 text-dark/40" size={28} />
          <h1 className="font-sans text-fluid-h4 text-dark mb-2">Not authorized</h1>
          <p className="text-dark/60">This console is limited to Arlo administrators.</p>
        </div>
      </div>
    );
  }

  const totals = rows
    ? {
        workspaces: rows.length,
        paying: rows.filter((r) => !["free", "solo"].includes(r.plan) || false).length,
        mrr: rows.reduce((s, r) => s + economics(r.plan, r.createdAt).mrr, 0),
        managed: rows.filter((r) => r.managedByAgency).length,
        mcpActive: rows.filter((r) => r.lastMcpUsedAt).length,
      }
    : null;

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            Admin · Arlo + Choquer
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">Command center</h1>
        </div>
        <button
          onClick={() => setProvisioning(true)}
          className="btn-secondary px-5 py-2.5 inline-flex items-center gap-2"
        >
          <UserPlus size={16} /> Provision client
        </button>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Kpi label="Workspaces" value={totals.workspaces} />
          <Kpi label="Est. MRR" value={`$${totals.mrr.toLocaleString()}`} accent />
          <Kpi label="Paying" value={totals.paying} />
          <Kpi label="Agency-managed" value={totals.managed} />
          <Kpi label="MCP-active" value={totals.mcpActive} />
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 bg-white border border-dark-faded rounded-lg px-3 py-2 max-w-md">
        <Search size={15} className="text-dark/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, website…"
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      <div className="bg-white border border-dark-faded rounded-lg overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-grey border-b border-dark-faded text-left">
              {["Workspace", "Owner", "Plan", "Status", "Clients", "Sources", "MCP", "Est. LTV", ""].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-dark/60">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const dLeft = daysUntil(r.trialEndsAt);
              const { ltv } = economics(r.plan, r.createdAt);
              return (
                <tr
                  key={r._id}
                  onClick={() => setSelected(r._id)}
                  className="border-b border-dark-faded last:border-0 hover:bg-grey cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="font-sans text-dark flex items-center gap-2">
                      {r.name}
                      {r.managedByAgency && (
                        <span className="font-mono text-[9px] uppercase tracking-wider bg-mint text-brand px-1.5 py-0.5 rounded">
                          Managed
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-dark/50">
                      {r.workspaceType} · {r.websites[0] ?? "no website"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark/70">{r.ownerEmail ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider">{r.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    {dLeft === null ? (
                      <span className="text-dark/50">—</span>
                    ) : dLeft < 0 ? (
                      <span className="font-mono text-[11px] uppercase tracking-wider text-bg-red">Expired</span>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-wider text-dark/70">
                        {dLeft}d left
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.clientCount}</td>
                  <td className="px-4 py-3 tabular-nums">{r.liveSources}</td>
                  <td className="px-4 py-3">
                    {r.lastMcpUsedAt ? (
                      <span className="font-mono text-[11px] text-brand">active</span>
                    ) : (
                      <span className="font-mono text-[11px] text-dark/40">never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">${ltv.toLocaleString()}</td>
                  <td className="px-4 py-3 text-dark/40">›</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-dark/50">
                  No workspaces match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <WorkspaceDrawer workspaceId={selected} onClose={() => setSelected(null)} />}
      {provisioning && <ProvisionModal onClose={() => setProvisioning(false)} />}
    </div>
  );
}

function genPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `arlo-${body.slice(0, 5)}-${body.slice(5)}`;
}

function ProvisionModal({ onClose }: { onClose: () => void }) {
  const provision = useAction(api.provisioning.provisionClient);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [website, setWebsite] = useState("");
  const [plan, setPlan] = useState("studio");
  const [trialDays, setTrialDays] = useState(30);
  const [tempPassword] = useState(genPassword());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await provision({
        email: email.trim().toLowerCase(),
        tempPassword,
        businessName: businessName.trim(),
        websiteUrl: website.trim() || undefined,
        contactName: contactName.trim() || undefined,
        plan,
        trialDays,
      });
      if (res.ok) setDone(true);
      else setError(res.error ?? "Failed to provision.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to provision.");
    } finally {
      setBusy(false);
    }
  }

  const loginBlurb = `You're set up on Arlo. Sign in at https://askarlo.app/sign-in\nEmail: ${email.trim().toLowerCase()}\nTemporary password: ${tempPassword}\nYou'll pick your own password on first login.`;

  return (
    <div className="fixed inset-0 z-50 bg-dark/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full p-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Check size={20} className="text-brand" />
              <h2 className="font-sans text-fluid-h4 text-dark">Client provisioned</h2>
            </div>
            <p className="text-dark/70 text-sm mb-5">
              Send these credentials to your client. They&apos;ll set their own password on first
              login and see a {trialDays}-day complimentary trial.
            </p>
            <pre className="bg-grey border border-dark-faded rounded-lg p-4 text-xs font-mono text-dark whitespace-pre-wrap mb-3">
              {loginBlurb}
            </pre>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(loginBlurb);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="btn-secondary px-5 py-2.5 inline-flex items-center gap-2"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy for client"}
              </button>
              <button onClick={onClose} className="px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-dark/60 hover:text-dark">
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2 className="font-sans text-fluid-h4 text-dark mb-1">Provision a client</h2>
            <p className="text-dark/60 text-sm mb-5">
              Creates their Arlo account, a single-business workspace, and a complimentary trial.
            </p>
            <div className="space-y-3">
              <Field label="Business name" value={businessName} onChange={setBusinessName} placeholder="Penni Cart" required />
              <Field label="Client email" value={email} onChange={setEmail} placeholder="owner@business.com" type="email" required />
              <Field label="Contact name (optional)" value={contactName} onChange={setContactName} placeholder="Jane Doe" />
              <Field label="Website (optional)" value={website} onChange={setWebsite} placeholder="business.com" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Comp plan</Label>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full border border-dark-faded rounded px-3 py-2.5 text-sm bg-white">
                    {["solo", "studio", "agency", "scale"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <Label>Trial days</Label>
                  <input
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value))}
                    className="w-full border border-dark-faded rounded px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label>Temporary password (auto-generated)</Label>
                <div className="font-mono text-sm bg-grey border border-dark-faded rounded px-3 py-2.5 text-dark">
                  {tempPassword}
                </div>
              </div>
              {error && <p className="text-bg-red text-sm">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-dark/60 hover:text-dark">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="btn-secondary px-6 py-2.5 disabled:opacity-50">
                {busy ? "Provisioning…" : "Provision"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-wider text-dark/60 mb-1">{children}</p>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-dark-faded rounded px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
      />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white border border-dark-faded rounded-lg p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-dark/60">{label}</p>
      <p className={`font-sans text-fluid-h5 mt-1 tabular-nums ${accent ? "text-brand" : "text-dark"}`}>
        {value}
      </p>
    </div>
  );
}

const PLAN_OPTIONS = ["free", "solo", "studio", "agency", "scale", "enterprise"];

function WorkspaceDrawer({
  workspaceId,
  onClose,
}: {
  workspaceId: Id<"workspaces">;
  onClose: () => void;
}) {
  const detail = useQuery(api.admin.getWorkspace, { workspaceId });
  const extendTrial = useMutation(api.admin.extendTrial);
  const setPlan = useMutation(api.admin.setPlan);
  const setManaged = useMutation(api.admin.setManaged);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  const ws = detail?.workspace;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-dark/40" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full bg-white overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!detail || !ws ? (
          <p className="text-dark/50">Loading…</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-fluid-h4 text-dark">{ws.name}</h2>
                <p className="font-mono text-[11px] text-dark/50 mt-1">
                  {ws.workspaceType} · {ws.plan} · created {new Date(ws.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={onClose} className="font-mono text-xs text-dark/50 hover:text-dark">
                Close ✕
              </button>
            </div>

            {/* Actions */}
            <div className="bg-grey border border-dark-faded rounded-lg p-4 mb-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-dark/60 mb-3">Actions</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    disabled={busy}
                    onClick={() => run(() => extendTrial({ workspaceId, days: d }))}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    +{d}d trial
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-dark/60">Plan</span>
                <select
                  value={ws.plan}
                  disabled={busy}
                  onChange={(e) => run(() => setPlan({ workspaceId, plan: e.target.value }))}
                  className="border border-dark-faded rounded px-2 py-1.5 text-sm bg-white"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <button
                disabled={busy}
                onClick={() => run(() => setManaged({ workspaceId, managed: !ws.managedByAgency }))}
                className="font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark underline"
              >
                {ws.managedByAgency ? "Unmark agency-managed" : "Mark agency-managed"}
              </button>
            </div>

            <Section title={`Clients (${detail.clients.length})`}>
              {detail.clients.map((c) => (
                <Line key={c._id} left={c.name} right={`${c.liveSources} sources · ${c.websiteUrl ?? "no site"}`} />
              ))}
            </Section>

            <Section title={`Team (${detail.members.length})`}>
              {detail.members.map((m, i) => (
                <Line key={i} left={m.email ?? m.name ?? "—"} right={m.role} />
              ))}
            </Section>

            <Section title="Connections">
              {detail.connections.length === 0 ? (
                <p className="text-dark/50 text-sm">None connected.</p>
              ) : (
                detail.connections.map((c, i) => (
                  <Line key={i} left={`${c.provider} (${c.accountEmail ?? "—"})`} right={c.status} />
                ))
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-wider text-dark/60 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Line({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-dark-faded last:border-0 text-sm">
      <span className="text-dark truncate">{left}</span>
      <span className="font-mono text-[11px] text-dark/50 shrink-0">{right}</span>
    </div>
  );
}

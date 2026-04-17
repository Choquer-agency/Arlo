"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Plus, Send, X } from "lucide-react";
import { usePersona } from "@/lib/usePersona";

const AGENCY_TEAM = [
  { id: "marcus", name: "Marcus Hale", email: "marcus@northpoint.co", role: "owner", lastActive: "2m ago" },
  { id: "priya", name: "Priya Sundaram", email: "priya@northpoint.co", role: "admin", lastActive: "2m ago" },
  { id: "jordan", name: "Jordan Flores", email: "jordan@northpoint.co", role: "admin", lastActive: "14m ago" },
  { id: "devin", name: "Devin Park", email: "devin@northpoint.co", role: "member", lastActive: "1h ago" },
  { id: "sam", name: "Sam Wexler", email: "sam@northpoint.co", role: "member", lastActive: "3h ago" },
  { id: "amelia", name: "Amelia Finch", email: "amelia@northpoint.co", role: "member", lastActive: "yesterday" },
  { id: "ken", name: "Ken Orozco", email: "ken@northpoint.co", role: "member", lastActive: "2 days ago" },
  { id: "lisa", name: "Lisa Tran", email: "lisa@northpoint.co", role: "member", lastActive: "never" },
];

const SOLO_TEAM = [
  { id: "alex", name: "Alex Rivera", email: "alex@tessellatecoffee.io", role: "owner", lastActive: "just now" },
];

const SOLO_SEAT_LIMIT = 3;

export default function DemoTeamPage() {
  const persona = usePersona();
  if (persona === "solo") return <SoloTeamView />;
  return <AgencyTeamView />;
}

// ──────────────────────────────────────────────────────────
// Agency view (existing)
// ──────────────────────────────────────────────────────────
function AgencyTeamView() {
  const router = useRouter();
  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            Team
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">{AGENCY_TEAM.length} members</h1>
        </div>
        <button className="btn-secondary px-6 py-3">Invite teammate</button>
      </div>

      <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-grey border-b border-dark-faded">
            <tr>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Name</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Email</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Role</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Last active</th>
            </tr>
          </thead>
          <tbody>
            {AGENCY_TEAM.map((m) => (
              <tr
                key={m.email}
                onClick={() => router.push(`/demo/team/${m.id}`)}
                className="border-b border-dark-faded last:border-0 hover:bg-grey cursor-pointer"
              >
                <td className="px-6 py-4 text-dark">{m.name}</td>
                <td className="px-6 py-4 text-dark opacity-60 font-mono text-sm">{m.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`font-mono text-xs uppercase tracking-wider px-2 py-1 rounded ${
                      m.role === "owner"
                        ? "bg-brand-neon text-dark"
                        : m.role === "admin"
                        ? "bg-mint text-brand"
                        : "text-dark opacity-60"
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-dark opacity-60">{m.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Solo view — 3-seat, full-access, invite flow
// ──────────────────────────────────────────────────────────
function SoloTeamView() {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invites, setInvites] = useState<{ email: string; sentAt: string }[]>([]);
  const totalUsed = SOLO_TEAM.length + invites.length;
  const slotsLeft = SOLO_SEAT_LIMIT - totalUsed;

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            Team · Solo plan
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">
            {totalUsed} of {SOLO_SEAT_LIMIT} seats used
          </h1>
          <p className="text-dark/70 text-fluid-main mt-2 max-w-xl">
            Solo includes 3 seats. Everyone on your team has full access.
          </p>
        </div>
        <button
          disabled={slotsLeft <= 0}
          onClick={() => setInviteOpen(true)}
          className={`btn-secondary px-6 py-3 inline-flex items-center gap-2 ${
            slotsLeft <= 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Plus size={14} /> Invite teammate
        </button>
      </div>

      <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-grey border-b border-dark-faded">
            <tr>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Name</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Email</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Status</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Last active</th>
            </tr>
          </thead>
          <tbody>
            {SOLO_TEAM.map((m) => (
              <tr
                key={m.email}
                onClick={() => router.push(`/demo/team/${m.id}`)}
                className="border-b border-dark-faded last:border-0 hover:bg-grey cursor-pointer"
              >
                <td className="px-6 py-4 text-dark">{m.name}</td>
                <td className="px-6 py-4 text-dark opacity-60 font-mono text-sm">{m.email}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs uppercase tracking-wider px-2 py-1 rounded bg-brand-neon text-dark">
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-dark opacity-60">{m.lastActive}</td>
              </tr>
            ))}
            {invites.map((inv) => (
              <tr
                key={inv.email}
                className="border-b border-dark-faded last:border-0 bg-grey/40"
              >
                <td className="px-6 py-4 text-dark/60 flex items-center gap-2">
                  <Mail size={14} className="text-dark/40" />
                  Invited
                </td>
                <td className="px-6 py-4 text-dark/80 font-mono text-sm">{inv.email}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs uppercase tracking-wider px-2 py-1 rounded bg-grey text-dark/70">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-dark opacity-60">
                  Sent {inv.sentAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inviteOpen && (
        <InviteModal
          slotsLeft={slotsLeft}
          onInvite={(email) =>
            setInvites((prev) => [...prev, { email, sentAt: "just now" }])
          }
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}

function InviteModal({
  slotsLeft,
  onInvite,
  onClose,
}: {
  slotsLeft: number;
  onInvite: (email: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    onInvite(trimmed);
    setSent(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-dark-faded shadow-2xl w-full max-w-md p-8"
      >
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="font-sans text-fluid-h4 text-dark">Invite a teammate</h2>
            <p className="text-dark opacity-60 text-sm mt-1">
              {slotsLeft} of {SOLO_SEAT_LIMIT} seats remaining · full access to Tessellate Coffee
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

        {sent ? (
          <div className="py-2">
            <p className="text-dark text-fluid-main mb-2">Invite sent to {email}.</p>
            <p className="text-dark/60 text-sm mb-6">
              They&apos;ll get an email with a sign-in link that expires in 7 days.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEmail("");
                  setSent(false);
                }}
                className="btn px-5 py-2"
              >
                Invite another
              </button>
              <button onClick={onClose} className="btn-secondary px-5 py-2">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-sans"
              />
            </div>
            <p className="text-dark/60 text-xs">
              Every teammate gets full access — same sources, same connections, same MCP URL.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn px-5 py-2">
                Cancel
              </button>
              <button type="submit" className="btn-secondary px-5 py-2 inline-flex items-center gap-2">
                <Send size={14} /> Send invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

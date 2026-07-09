"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Inbox, Mail, MailOpen, Archive, ChevronDown, Search } from "lucide-react";

type Message = {
  _id: Id<"contactMessages">;
  category: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  message?: string;
  needs?: string;
  companySize?: string;
  clientCount?: string;
  referral?: string;
  selectedPackage?: string;
  source?: string;
  pageUrl?: string;
  status: string;
  createdAt: string;
};

const CATEGORIES = [
  { key: "bug", label: "Bug", color: "#c0392b", bg: "rgba(192,57,43,.12)" },
  { key: "feature", label: "Feature", color: "#2563eb", bg: "rgba(37,99,235,.12)" },
  { key: "enterprise", label: "Enterprise", color: "#8F5AF0", bg: "rgba(143,90,240,.12)" },
  { key: "pricing", label: "Pricing", color: "#0f8a4f", bg: "rgba(15,138,79,.12)" },
  { key: "general", label: "General", color: "#6b7280", bg: "rgba(107,114,128,.14)" },
] as const;

function cat(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[4];
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Badge({ category }: { category: string }) {
  const c = cat(category);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

export function MessagesPanel({ isAdmin }: { isAdmin: boolean }) {
  const messages = useQuery(api.contactMessages.list, isAdmin ? {} : "skip") as
    | Message[]
    | undefined;
  const setStatus = useMutation(api.contactMessages.setStatus);

  const [filter, setFilter] = useState<string>("all"); // all | new | <category>
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<Id<"contactMessages"> | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, new: 0 };
    CATEGORIES.forEach((cat) => (c[cat.key] = 0));
    (messages ?? []).forEach((m) => {
      if (m.status === "archived") return;
      c.all++;
      if (m.status === "new") c.new++;
      c[m.category] = (c[m.category] ?? 0) + 1;
    });
    return c;
  }, [messages]);

  const filtered = useMemo(() => {
    let list = (messages ?? []).filter((m) => m.status !== "archived");
    if (filter === "new") list = list.filter((m) => m.status === "new");
    else if (filter !== "all") list = list.filter((m) => m.category === filter);
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((m) =>
        [m.name, m.email, m.company, m.message].some((f) =>
          (f ?? "").toLowerCase().includes(needle)
        )
      );
    }
    return list;
  }, [messages, filter, q]);

  function open(m: Message) {
    setOpenId((prev) => (prev === m._id ? null : m._id));
    if (m.status === "new") setStatus({ id: m._id, status: "read" });
  }

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "Unread" },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
  ];

  return (
    <div>
      {/* filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map((t) => {
          const active = filter === t.key;
          const n = counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "border-dark bg-dark text-white"
                  : "border-dark-faded bg-white text-dark/70 hover:text-dark"
              }`}
            >
              {t.label}
              <span
                className={`tabular-nums text-xs ${active ? "text-white/70" : "text-dark/40"}`}
              >
                {n}
              </span>
            </button>
          );
        })}
        <div className="flex items-center gap-2 ml-auto bg-white border border-dark-faded rounded-lg px-3 py-1.5">
          <Search size={14} className="text-dark/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages…"
            className="outline-none text-sm bg-transparent w-44"
          />
        </div>
      </div>

      {messages === undefined ? (
        <div className="bg-white border border-dark-faded rounded-lg p-12 text-center text-dark/40">
          Loading messages…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dark-faded rounded-lg p-12 text-center">
          <Inbox className="mx-auto mb-3 text-dark/30" size={26} />
          <p className="text-dark/60">
            {counts.all === 0 ? "No messages yet." : "Nothing in this view."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-dark-faded rounded-lg divide-y divide-dark-faded overflow-hidden">
          {filtered.map((m) => {
            const isOpen = openId === m._id;
            const unread = m.status === "new";
            return (
              <div key={m._id}>
                <button
                  onClick={() => open(m)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-grey/40 transition-colors"
                >
                  <span className="shrink-0">
                    {unread ? (
                      <Mail size={16} className="text-brand" />
                    ) : (
                      <MailOpen size={16} className="text-dark/30" />
                    )}
                  </span>
                  <span className="shrink-0 w-24">
                    <Badge category={m.category} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={`truncate ${unread ? "font-medium text-dark" : "text-dark/80"}`}
                      >
                        {m.name || m.email || "Someone"}
                      </span>
                      {m.company && (
                        <span className="text-dark/40 text-sm truncate">· {m.company}</span>
                      )}
                    </span>
                    <span className="block truncate text-sm text-dark/50">
                      {m.message || m.needs || "—"}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-dark/40 tabular-nums w-20 text-right">
                    {timeAgo(m.createdAt)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-dark/30 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 pt-1 bg-grey/30 border-t border-dark-faded">
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4 mt-3">
                      <Detail label="Name" value={m.name} />
                      <Detail label="Email" value={m.email} email />
                      <Detail label="Company" value={m.company} />
                      <Detail label="Role" value={m.role} />
                      <Detail label="Team size" value={m.companySize} />
                      <Detail label="Clients" value={m.clientCount} />
                      <Detail label="Needs" value={m.needs} />
                      <Detail label="Package" value={m.selectedPackage} />
                      <Detail label="Referral" value={m.referral} />
                      <Detail label="Source" value={m.source} />
                    </div>
                    {m.message && (
                      <div className="mb-4">
                        <p className="font-mono text-xs uppercase tracking-wider text-dark/40 mb-1">
                          Message
                        </p>
                        <p className="text-sm text-dark whitespace-pre-wrap bg-white border border-dark-faded rounded-lg p-3">
                          {m.message}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <a
                        href={`mailto:${m.email}?subject=Re: your ${m.category} message to ARLO`}
                        className="btn-secondary px-4 py-2 inline-flex items-center gap-2 text-sm"
                      >
                        <Mail size={14} /> Reply
                      </a>
                      <button
                        onClick={() =>
                          setStatus({
                            id: m._id,
                            status: m.status === "new" ? "read" : "new",
                          })
                        }
                        className="px-4 py-2 text-sm text-dark/60 hover:text-dark inline-flex items-center gap-2"
                      >
                        {m.status === "new" ? (
                          <>
                            <MailOpen size={14} /> Mark read
                          </>
                        ) : (
                          <>
                            <Mail size={14} /> Mark unread
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setStatus({ id: m._id, status: "archived" });
                          setOpenId(null);
                        }}
                        className="px-4 py-2 text-sm text-dark/60 hover:text-dark inline-flex items-center gap-2 ml-auto"
                      >
                        <Archive size={14} /> Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  email,
}: {
  label: string;
  value?: string;
  email?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-dark/40 w-24 shrink-0">{label}</span>
      {email ? (
        <a href={`mailto:${value}`} className="text-dark underline underline-offset-2 truncate">
          {value}
        </a>
      ) : (
        <span className="text-dark truncate">{value}</span>
      )}
    </div>
  );
}

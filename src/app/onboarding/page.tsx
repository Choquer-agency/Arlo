"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Building2, Users, Check, ArrowRight, Plus } from "lucide-react";
import { ArloMark } from "@/components/ArloMark";
import { SignInShell } from "@/components/SignInCard";
import { AccountPicker } from "@/components/app/dashboard/AccountPicker";
import { googleStartHref } from "@/lib/oauth";
import { GOOGLE_SOURCES } from "@/lib/googleSources";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type WorkspaceType = "solo" | "agency";
type Step = "persona" | "business" | "connect";

export default function OnboardingPage() {
  return (
    <SignInShell>
      <Suspense fallback={null}>
        <Wizard />
      </Suspense>
    </SignInShell>
  );
}

function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const company = params.get("company")?.trim() ?? "";
  const firstName = params.get("first")?.trim() ?? "";

  const myWorkspaces = useQuery(api.workspaces.listMine);
  const createWorkspace = useMutation(api.workspaces.create);
  const createClient = useMutation(api.clients.create);

  const [step, setStep] = useState<Step>("persona");
  const [type, setType] = useState<WorkspaceType | null>(null);
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a workspace already exists (returning here, or landing back from the
  // Google OAuth with ?status=ok), resume instead of making a duplicate.
  const returning = params.get("status") === "ok";
  useEffect(() => {
    if (!myWorkspaces || myWorkspaces.length === 0) return;
    setWorkspaceId(myWorkspaces[0]._id);
    setType((myWorkspaces[0].workspaceType as WorkspaceType) ?? "agency");
    setStep((s) => (returning ? "connect" : s === "persona" ? "business" : s));
  }, [myWorkspaces, returning]);

  async function pickPersona(t: WorkspaceType) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const name = company || (t === "solo" ? "My Business" : "My Agency");
      const res = await createWorkspace({ name, workspaceType: t, skipAutoClient: true });
      setType(t);
      setWorkspaceId(res.workspaceId as Id<"workspaces">);
      setStep("business");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function addBusiness(name: string, website: string) {
    if (!workspaceId) return;
    setBusy(true);
    setError(null);
    try {
      await createClient({
        workspaceId,
        name: name.trim(),
        websiteUrl: website.trim() || undefined,
      });
      setStep("connect");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add your business.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-[560px]">
      <div className="flex justify-center mb-6">
        <ArloMark className="h-9 w-auto text-[#8F93FF]" />
      </div>
      <StepDots step={step} />

      {step === "persona" && (
        <PersonaStep firstName={firstName} onPick={pickPersona} busy={busy} error={error} />
      )}
      {step === "business" && type && (
        <BusinessStep
          type={type}
          defaultName={type === "solo" ? company : ""}
          onSubmit={addBusiness}
          busy={busy}
          error={error}
        />
      )}
      {step === "connect" && workspaceId && (
        <ConnectStep workspaceId={workspaceId} onFinish={() => router.replace("/dashboard")} />
      )}
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["persona", "business", "connect"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i === idx ? "w-8 bg-[#14181c]" : i < idx ? "w-4 bg-[#8F93FF]" : "w-4 bg-black/10"
          }`}
        />
      ))}
    </div>
  );
}

/* ── Step 1: who are you ─────────────────────────────────────────── */
function PersonaStep({
  firstName,
  onPick,
  busy,
  error,
}: {
  firstName: string;
  onPick: (t: WorkspaceType) => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="text-center">
      <h1 className="font-serif font-normal text-[2.1rem] leading-[1.1] tracking-[-0.04em] text-[#14181c] mb-2">
        {firstName ? `Welcome, ${firstName}.` : "Welcome to ARLO."}
      </h1>
      <p className="text-[#14181c]/55 mb-8">Which sounds like you? This just tailors your workspace.</p>

      <div className="grid sm:grid-cols-2 gap-4 text-left">
        <PersonaCard
          icon={<Building2 size={22} />}
          title="I run one business"
          description="Plug Claude into your own analytics, ads, and store — a simple single-business view."
          onClick={() => onPick("solo")}
          disabled={busy}
        />
        <PersonaCard
          icon={<Users size={22} />}
          title="I'm an agency"
          description="Manage many clients, each with their own connected accounts and a shared team."
          onClick={() => onPick("agency")}
          disabled={busy}
        />
      </div>
      {error && <p className="text-[#c0392b] text-sm mt-5">{error}</p>}
      <p className="text-sm text-[#14181c]/45 mt-6">You can switch anytime — it only changes the layout.</p>
    </div>
  );
}

function PersonaCard({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group text-left rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm transition-all hover:border-[#8F93FF] hover:shadow-md disabled:opacity-50"
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecedfb] text-[#6b6fc4]">
        {icon}
      </span>
      <h2 className="font-medium text-[1.15rem] text-[#14181c] mb-1.5">{title}</h2>
      <p className="text-[0.95rem] text-[#14181c]/60 leading-relaxed">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#14181c] opacity-0 group-hover:opacity-100 transition-opacity">
        Continue <ArrowRight size={15} />
      </span>
    </button>
  );
}

/* ── Step 2: add your business / first client ────────────────────── */
function BusinessStep({
  type,
  defaultName,
  onSubmit,
  busy,
  error,
}: {
  type: WorkspaceType;
  defaultName: string;
  onSubmit: (name: string, website: string) => void;
  busy: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(defaultName);
  const [website, setWebsite] = useState("");
  const heading = type === "solo" ? "Add your business" : "Add your first client";
  const sub =
    type === "solo"
      ? "This is the business ARLO will report on. You can add its details anytime."
      : "You can add the rest of your clients once you're in.";

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white/90 px-4 py-3 text-[0.95rem] text-[#14181c] placeholder:text-[#14181c]/30 shadow-sm focus:outline-none focus:border-[#8F93FF] focus:ring-2 focus:ring-[#8F93FF]/20 transition-all";

  function handle(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, website);
  }

  return (
    <div className="mx-auto max-w-[440px] text-center">
      <h1 className="font-serif font-normal text-[2.1rem] leading-[1.1] tracking-[-0.04em] text-[#14181c] mb-2">
        {heading}
      </h1>
      <p className="text-[#14181c]/55 mb-7">{sub}</p>
      <form onSubmit={handle} className="space-y-3 text-left">
        <div>
          <label className="block text-sm font-medium text-[#14181c] mb-1.5">
            {type === "solo" ? "Business name" : "Client name"}
          </label>
          <input
            autoFocus
            required
            placeholder={type === "solo" ? "Tessellate Coffee" : "Northpoint Retail"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#14181c] mb-1.5">
            Website <span className="text-[#14181c]/40 font-normal">(optional)</span>
          </label>
          <input
            placeholder="tessellate.co"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-[#c0392b] text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#14181c] text-white py-3.5 text-[0.95rem] font-medium hover:brightness-150 disabled:opacity-50 transition-all"
        >
          {busy ? "…" : <>Continue <ArrowRight size={16} /></>}
        </button>
      </form>
    </div>
  );
}

/* ── Step 3: connect Google, then map accounts, then finish ──────── */
function ConnectStep({
  workspaceId,
  onFinish,
}: {
  workspaceId: Id<"workspaces">;
  onFinish: () => void;
}) {
  const connections = useQuery(api.platformConnections.listForWorkspace, { workspaceId });
  const clients = useQuery(api.clients.list, { workspaceId });
  const googleConn = connections?.find((c) => c.provider === "google");
  const googleConnected = googleConn?.status === "active";
  const accounts = googleConn?.availableAccounts ?? [];
  const business = clients?.[0];

  // ── Not connected yet: the connect prompt ──
  if (!googleConnected) {
    return (
      <div className="mx-auto max-w-[460px] text-center">
        <h1 className="font-serif font-normal text-[2.1rem] leading-[1.1] tracking-[-0.04em] text-[#14181c] mb-2">
          Connect your data
        </h1>
        <p className="text-[#14181c]/55 mb-7">
          One Google sign-in unlocks GA4, Search Console, Google Ads, and Business Profile —
          then you&apos;ll pick which account powers each.
        </p>
        <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm text-left flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sources/ga4.svg" alt="" className="h-8 w-8" />
            <div>
              <p className="font-medium text-[#14181c]">Google</p>
              <p className="text-sm text-[#14181c]/55">GA4, Search Console, Ads, GBP</p>
            </div>
          </div>
          <a
            href={googleStartHref(workspaceId, "/onboarding")}
            className="shrink-0 rounded-lg bg-[#14181c] px-5 py-2.5 text-sm font-medium text-white hover:brightness-150 transition-all"
          >
            Connect Google
          </a>
        </div>
        <button onClick={onFinish} className="mt-5 text-sm text-[#14181c]/50 hover:text-[#14181c]">
          Skip for now — I&apos;ll connect later
        </button>
      </div>
    );
  }

  // ── Connected: map each source to the business ──
  const mappedCount = business
    ? GOOGLE_SOURCES.filter((s) => !!(business as Doc<"clients">)[s.field]).length
    : 0;

  return (
    <div className="mx-auto max-w-[520px] text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 mb-4">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500">
          <Check size={11} strokeWidth={3} className="text-white" />
        </span>
        Google connected · {googleConn?.accountEmail}
      </span>
      <h1 className="font-serif font-normal text-[2.1rem] leading-[1.1] tracking-[-0.04em] text-[#14181c] mb-2">
        Map your accounts
      </h1>
      <p className="text-[#14181c]/55 mb-7">
        Pick which account powers each source for{" "}
        <span className="font-medium text-[#14181c]">{business?.name ?? "your business"}</span>. You
        can map more, or change these, anytime.
      </p>

      <div className="space-y-3 text-left">
        {GOOGLE_SOURCES.map((s) => {
          const opts = accounts.filter((a) => a.kind === s.kind);
          const current = business ? (business as Doc<"clients">)[s.field] : undefined;
          return (
            <div key={s.key} className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt="" className="h-6 w-6" />
                <span className="font-medium text-[#14181c]">{s.label}</span>
                {current && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <Check size={13} strokeWidth={3} /> Mapped
                  </span>
                )}
              </div>
              {opts.length === 0 ? (
                <p className="text-sm text-[#14181c]/45 pl-9">
                  No {s.short} accounts on this Google login.
                </p>
              ) : business ? (
                <div className="pl-9 pt-1">
                  <AccountPicker
                    workspaceId={workspaceId}
                    clientId={business._id}
                    accounts={accounts}
                    accountKind={s.kind}
                    assignmentField={s.field}
                    label={s.pickerLabel}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <a
        href={googleStartHref(workspaceId, "/onboarding")}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#14181c]/60 hover:text-[#14181c]"
      >
        <Plus size={14} /> Connect another Google account
      </a>

      <button
        onClick={onFinish}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-[#14181c] text-white py-3.5 text-[0.95rem] font-medium hover:brightness-150 transition-all"
      >
        Start using ARLO <ArrowRight size={16} />
      </button>
      {mappedCount === 0 && (
        <p className="mt-3 text-sm text-[#14181c]/45">
          Tip: map at least one source so Claude has data to read on day one.
        </p>
      )}
    </div>
  );
}

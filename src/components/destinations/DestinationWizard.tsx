"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { X, Check, AlertTriangle, ChevronRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  DESTINATION_CATALOG,
  STATUS_LABELS,
  SYNC_MODE_LABELS,
  type DestinationEntry,
} from "@/lib/destinations/catalog";
import { hasAdapter, isRealAdapter } from "@/lib/destinations/capabilities";

type Step = "pick" | "configure" | "sources" | "saving" | "done";

const SOURCE_OPTIONS: { id: string; name: string; defaultMetrics: string[] }[] = [
  { id: "ga4", name: "Google Analytics 4", defaultMetrics: ["sessions", "active_users", "conversions"] },
  { id: "gsc", name: "Search Console", defaultMetrics: ["clicks", "impressions", "ctr", "position"] },
  { id: "google_ads", name: "Google Ads", defaultMetrics: ["cost", "clicks", "conversions"] },
  { id: "shopify", name: "Shopify", defaultMetrics: ["revenue", "orders", "aov"] },
];

const SCHEDULES: { value: string; label: string; hint: string }[] = [
  { value: "daily", label: "Daily", hint: "Runs every 24 hours" },
  { value: "weekly", label: "Weekly", hint: "Runs every 7 days" },
  { value: "hourly", label: "Hourly", hint: "Runs every 60 minutes" },
  { value: "manual", label: "Manual only", hint: "No schedule — run on demand" },
];

export interface DestinationWizardProps {
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  clientName: string;
  onClose: () => void;
}

// Generic per-kind form state bucket. Each adapter only reads the fields it needs.
interface KindState {
  // slack_digest
  webhookUrl: string;
  // email_digest
  recipients: string;
  fromAddress: string;
  fromName: string;
  // shareable_dashboard
  expiresInDays: string;
  // shared
  destName: string;
}

function initialKindState(): KindState {
  return {
    webhookUrl: "",
    recipients: "",
    fromAddress: "",
    fromName: "",
    expiresInDays: "90",
    destName: "",
  };
}

function buildCredentials(kind: string, s: KindState): unknown {
  switch (kind) {
    case "slack_digest":
      return { webhookUrl: s.webhookUrl.trim() };
    case "email_digest":
      return {}; // uses RESEND_API_KEY env var
    case "shareable_dashboard":
      return {}; // token-based, stored separately
    default:
      return {};
  }
}

function buildConfig(kind: string, s: KindState, clientName: string, sourceId: string): unknown {
  const source = SOURCE_OPTIONS.find((x) => x.id === sourceId) ?? SOURCE_OPTIONS[0];
  switch (kind) {
    case "slack_digest":
      return { clientDisplayName: clientName };
    case "email_digest":
      return {
        recipients: s.recipients
          .split(/[,\n]/)
          .map((r) => r.trim())
          .filter(Boolean),
        fromAddress: s.fromAddress.trim() || undefined,
        fromName: s.fromName.trim() || undefined,
        clientDisplayName: clientName,
      };
    case "shareable_dashboard": {
      const days = parseInt(s.expiresInDays, 10);
      const expiresAt = isFinite(days) && days > 0 ? Date.now() + days * 86400000 : undefined;
      return {
        clientDisplayName: clientName,
        expiresAt,
        sources: [
          {
            platform: source.id,
            label: source.name,
            metrics: source.defaultMetrics,
            dateRange: { preset: "last_28_days" },
          },
        ],
      };
    }
    default:
      return {};
  }
}

function validCredentials(kind: string, s: KindState): boolean {
  switch (kind) {
    case "slack_digest":
      return /^https:\/\/hooks\.slack\.com\//.test(s.webhookUrl.trim());
    case "email_digest":
      return s.recipients.trim().length > 0 && s.fromAddress.trim().includes("@");
    case "shareable_dashboard":
      return true;
    default:
      return false;
  }
}

// Returns a random URL-safe token. Used for shareable_dashboard.
function generateToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function DestinationWizard({
  workspaceId,
  clientId,
  clientName,
  onClose,
}: DestinationWizardProps) {
  const [step, setStep] = useState<Step>("pick");
  const [picked, setPicked] = useState<DestinationEntry | null>(null);
  const [state, setState] = useState<KindState>(initialKindState());

  const [testState, setTestState] = useState<null | { ok: boolean; message: string }>(null);
  const [testing, setTesting] = useState(false);

  const [sourceId, setSourceId] = useState<string>("ga4");
  const [schedule, setSchedule] = useState<string>("daily");

  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const createDestination = useMutation(api.destinations.create);
  const createSync = useMutation(api.destinationSyncs.create);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const adapterReady = picked ? isRealAdapter(picked.id) : false;
  const needsTest = picked?.id === "slack_digest" || picked?.id === "email_digest";

  async function handleTest() {
    if (!picked) return;
    setTesting(true);
    setTestState(null);
    try {
      const res = await fetch("/api/destinations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: picked.id,
          credentials: buildCredentials(picked.id, state),
          config: buildConfig(picked.id, state, clientName, sourceId),
        }),
      });
      const json = (await res.json()) as { ok: boolean; message: string };
      setTestState(json);
    } catch (err) {
      setTestState({
        ok: false,
        message: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    if (!picked) return;
    setSaveError(null);
    setStep("saving");
    try {
      const source = SOURCE_OPTIONS.find((s) => s.id === sourceId) ?? SOURCE_OPTIONS[0];

      // 1. Encrypt credentials server-side. Even empty-credentials adapters go
      //    through encrypt so the schema stays uniform.
      const creds = buildCredentials(picked.id, state);
      // 2. For shareable_dashboard, generate a token and stash its hash on the
      //    destination row. Share URL is /share/<raw_token>.
      let liveTokenHash: string | undefined;
      let generatedShareUrl: string | null = null;
      if (picked.id === "shareable_dashboard") {
        const token = generateToken();
        liveTokenHash = await sha256Hex(token);
        generatedShareUrl = `${window.location.origin}/share/${token}`;
      }

      const encRes = await fetch("/api/destinations/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plaintext: JSON.stringify(creds) }),
      });
      if (!encRes.ok) throw new Error("Failed to encrypt credentials");
      const { ciphertext, iv } = (await encRes.json()) as { ciphertext: string; iv: string };

      const destinationId = await createDestination({
        workspaceId,
        clientId,
        kind: picked.id,
        mode: picked.syncMode,
        name: state.destName.trim() || `${picked.name} · ${clientName}`,
        authType:
          picked.id === "slack_digest"
            ? "webhook_url"
            : picked.id === "email_digest"
            ? "api_key"
            : "internal",
        encryptedCredentials: ciphertext,
        credentialsIv: iv,
        config: buildConfig(picked.id, state, clientName, sourceId),
        liveTokenHash,
      });

      // Only push/digest destinations need a sync row (schedule). Live connectors
      // pull on demand — no sync. Shareable dashboard uses digest mode but doesn't
      // need a sync either; we create one so the dashboard self-heals on schedule
      // (confirms the token is valid, surfaces expired-link errors).
      if (picked.syncMode !== "live") {
        await createSync({
          workspaceId,
          destinationId,
          datasetKey: `platform:${source.id}`,
          params: {
            platform: source.id,
            metrics: source.defaultMetrics,
            dateRange: { preset: "last_7_days" },
          },
          schedule,
          enabled: true,
        });
      }

      if (generatedShareUrl) setShareUrl(generatedShareUrl);
      setStep("done");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setStep("configure");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-dark-faded shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
      >
        <div className="flex items-start justify-between p-6 border-b border-dark-faded gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-brand mb-1">
              Add destination · {clientName}
            </p>
            <h2 className="font-sans text-fluid-h4 text-dark">
              {step === "pick" && "Pick a destination"}
              {step === "configure" && picked && `Connect ${picked.name}`}
              {step === "sources" && "Choose source and cadence"}
              {step === "saving" && "Saving…"}
              {step === "done" && "Destination added"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-grey text-dark/60 hover:text-dark flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {step === "pick" && (
          <PickStep
            onSelect={(d) => {
              setPicked(d);
              setState(initialKindState());
              setTestState(null);
              setStep("configure");
            }}
          />
        )}

        {step === "configure" && picked && (
          <ConfigureStep
            destination={picked}
            adapterReady={adapterReady}
            state={state}
            onStateChange={setState}
            testing={testing}
            testState={testState}
            onTest={needsTest ? handleTest : undefined}
            saveError={saveError}
            onNext={() => {
              // Shareable dashboard has no schedule/sources — skip that step.
              if (picked.syncMode === "live" || picked.id === "shareable_dashboard") {
                handleSave();
              } else {
                setStep("sources");
              }
            }}
            canProceed={
              adapterReady &&
              validCredentials(picked.id, state) &&
              (!needsTest || testState?.ok === true)
            }
            onBack={() => {
              setPicked(null);
              setState(initialKindState());
              setTestState(null);
              setStep("pick");
            }}
          />
        )}

        {step === "sources" && picked && (
          <SourcesStep
            sourceId={sourceId}
            onSourceIdChange={setSourceId}
            schedule={schedule}
            onScheduleChange={setSchedule}
            onBack={() => setStep("configure")}
            onSave={handleSave}
          />
        )}

        {step === "saving" && (
          <div className="p-10 text-center">
            <p className="font-sans text-dark">Saving destination…</p>
          </div>
        )}

        {step === "done" && picked && (
          <div className="p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-mint text-brand flex items-center justify-center mb-4">
              <Check size={22} />
            </div>
            <p className="font-sans text-fluid-h5 text-dark mb-2">{picked.name} is live</p>
            <p className="text-dark opacity-60 text-fluid-main max-w-md mx-auto mb-6">
              {picked.syncMode === "live"
                ? "Open Looker Studio and paste your bearer token to start rendering."
                : picked.id === "shareable_dashboard"
                ? "Copy the share URL below and send it to the client. Opens without a login."
                : "The first run will kick off on the schedule you picked. Use Run now on the destination row for an immediate preview."}
            </p>
            {shareUrl && (
              <div className="bg-grey border border-dark-faded rounded-lg p-4 mb-6 text-left">
                <p className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-60 mb-2">
                  Share this URL (save it — it won&apos;t be shown again)
                </p>
                <p className="font-mono text-xs text-dark break-all">{shareUrl}</p>
              </div>
            )}
            <button onClick={onClose} className="btn-secondary px-6 py-3">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PickStep({ onSelect }: { onSelect: (d: DestinationEntry) => void }) {
  const ready = DESTINATION_CATALOG.filter((d) => isRealAdapter(d.id));
  const pending = DESTINATION_CATALOG.filter((d) => hasAdapter(d.id) && !isRealAdapter(d.id)).slice(0, 8);

  return (
    <div className="p-6 space-y-2 max-h-[65vh] overflow-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
        Ready to ship
      </p>
      {ready.map((d) => (
        <DestinationPickCard key={d.id} destination={d} onSelect={() => onSelect(d)} />
      ))}
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-6 mb-3">
        Coming soon
      </p>
      {pending.map((d) => (
        <DestinationPickCard
          key={d.id}
          destination={d}
          disabled
          onSelect={() => onSelect(d)}
        />
      ))}
    </div>
  );
}

function DestinationPickCard({
  destination,
  onSelect,
  disabled,
}: {
  destination: DestinationEntry;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-4 border rounded-lg text-left transition-colors ${
        disabled
          ? "border-dark-faded opacity-50 cursor-not-allowed"
          : "border-dark-faded hover:border-brand hover:bg-grey"
      }`}
    >
      <div
        className="w-10 h-10 rounded flex items-center justify-center font-display text-white text-lg shrink-0"
        style={{ backgroundColor: destination.color }}
      >
        {destination.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-dark truncate">{destination.name}</p>
        <p className="font-mono text-[11px] text-dark opacity-60 truncate">
          {destination.tagline}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-50">
          {SYNC_MODE_LABELS[destination.syncMode]}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-50">
          · {STATUS_LABELS[destination.status]}
        </span>
        {!disabled && <ChevronRight size={14} className="text-dark opacity-60" />}
      </div>
    </button>
  );
}

function ConfigureStep(props: {
  destination: DestinationEntry;
  adapterReady: boolean;
  state: KindState;
  onStateChange: (s: KindState) => void;
  testing: boolean;
  testState: null | { ok: boolean; message: string };
  onTest?: () => void;
  saveError: string | null;
  onNext: () => void;
  canProceed: boolean;
  onBack: () => void;
}) {
  const update = (patch: Partial<KindState>) =>
    props.onStateChange({ ...props.state, ...patch });

  if (!props.adapterReady) {
    return (
      <div className="p-6">
        <div className="bg-grey border border-dark-faded rounded-lg p-5 text-dark">
          <p className="font-sans text-dark mb-1">Not ready yet</p>
          <p className="text-dark opacity-60 text-sm">
            {props.destination.name} is on the roadmap. Join the waitlist from the
            destinations catalog to vote it up the queue.
          </p>
        </div>
        <div className="flex justify-start mt-5">
          <button
            onClick={props.onBack}
            className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const kind = props.destination.id;

  return (
    <div className="p-6 space-y-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
          Destination name
        </label>
        <input
          type="text"
          value={props.state.destName}
          onChange={(e) => update({ destName: e.target.value })}
          placeholder={`${props.destination.name} · digest`}
          className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-sans focus:outline-none focus:border-brand"
        />
      </div>

      {kind === "slack_digest" && (
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
            Slack incoming webhook URL
          </label>
          <input
            type="url"
            value={props.state.webhookUrl}
            onChange={(e) => update({ webhookUrl: e.target.value })}
            placeholder="https://hooks.slack.com/services/…"
            className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-mono text-sm focus:outline-none focus:border-brand"
          />
          <p className="text-dark opacity-60 text-xs mt-2">
            In Slack → Apps → &quot;Incoming Webhooks&quot; → create one for the channel
            you want digests posted to. Paste the URL here.
          </p>
        </div>
      )}

      {kind === "email_digest" && (
        <>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
              Recipient emails (comma-separated)
            </label>
            <textarea
              value={props.state.recipients}
              onChange={(e) => update({ recipients: e.target.value })}
              placeholder="ceo@client.com, marketing@client.com"
              rows={2}
              className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-mono text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                From address
              </label>
              <input
                type="email"
                value={props.state.fromAddress}
                onChange={(e) => update({ fromAddress: e.target.value })}
                placeholder="reports@agency.co"
                className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-mono text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                From name
              </label>
              <input
                type="text"
                value={props.state.fromName}
                onChange={(e) => update({ fromName: e.target.value })}
                placeholder="ARLO · Agency"
                className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-sans focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <p className="text-dark opacity-60 text-xs">
            Sending uses Resend. Ensure your sender domain is verified in the Resend
            dashboard and <code className="font-mono">RESEND_API_KEY</code> is set in
            your environment.
          </p>
        </>
      )}

      {kind === "shareable_dashboard" && (
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
            Link expires in (days)
          </label>
          <input
            type="number"
            min={1}
            value={props.state.expiresInDays}
            onChange={(e) => update({ expiresInDays: e.target.value })}
            className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white font-mono text-sm focus:outline-none focus:border-brand"
          />
          <p className="text-dark opacity-60 text-xs mt-2">
            After expiration the URL shows an &ldquo;expired&rdquo; notice. Leave blank for no expiration.
          </p>
        </div>
      )}

      {props.onTest && (
        <div className="flex items-center gap-3">
          <button
            onClick={props.onTest}
            disabled={props.testing}
            className="btn px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {props.testing ? "Testing…" : "Send test"}
          </button>
          {props.testState && (
            <span
              className={`flex items-center gap-1.5 text-sm ${
                props.testState.ok ? "text-brand" : "text-bg-red"
              }`}
            >
              {props.testState.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
              {props.testState.message}
            </span>
          )}
        </div>
      )}

      {props.saveError && (
        <div className="bg-bg-red/10 border border-bg-red/30 rounded p-3 text-bg-red text-sm">
          {props.saveError}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={props.onBack}
          className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
        >
          ← Pick a different destination
        </button>
        <button
          onClick={props.onNext}
          disabled={!props.canProceed}
          className="btn-secondary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SourcesStep(props: {
  sourceId: string;
  onSourceIdChange: (v: string) => void;
  schedule: string;
  onScheduleChange: (v: string) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
          Source to include
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SOURCE_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => props.onSourceIdChange(s.id)}
              className={`px-4 py-3 border rounded text-left ${
                props.sourceId === s.id
                  ? "border-brand bg-mint"
                  : "border-dark-faded hover:border-dark"
              }`}
            >
              <p className="font-sans text-dark text-sm">{s.name}</p>
              <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5 truncate">
                {s.defaultMetrics.join(", ")}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
          Cadence
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SCHEDULES.map((s) => (
            <button
              key={s.value}
              onClick={() => props.onScheduleChange(s.value)}
              className={`px-4 py-3 border rounded text-left ${
                props.schedule === s.value
                  ? "border-brand bg-mint"
                  : "border-dark-faded hover:border-dark"
              }`}
            >
              <p className="font-sans text-dark text-sm">{s.label}</p>
              <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5">{s.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={props.onBack}
          className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
        >
          ← Back
        </button>
        <button onClick={props.onSave} className="btn-secondary px-6 py-2.5">
          Activate destination
        </button>
      </div>
    </div>
  );
}

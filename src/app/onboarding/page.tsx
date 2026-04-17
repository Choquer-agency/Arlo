"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Building2, Users } from "lucide-react";

type Step = "persona" | "name";
type WorkspaceType = "solo" | "agency";

export default function OnboardingPage() {
  const router = useRouter();
  const myWorkspaces = useQuery(api.workspaces.listMine);
  const createWorkspace = useMutation(api.workspaces.create);
  const [step, setStep] = useState<Step>("persona");
  const [type, setType] = useState<WorkspaceType | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (myWorkspaces && myWorkspaces.length > 0) {
      router.replace("/dashboard");
    }
  }, [myWorkspaces, router]);

  function pickPersona(t: WorkspaceType) {
    setType(t);
    setStep("name");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !type) return;
    setSubmitting(true);
    setError(null);
    try {
      await createWorkspace({ name: name.trim(), workspaceType: type });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-mint px-6 py-12">
      <div className="w-full max-w-2xl">
        {step === "persona" && <PersonaPicker onPick={pickPersona} />}
        {step === "name" && type && (
          <NameStep
            type={type}
            name={name}
            setName={setName}
            onBack={() => setStep("persona")}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </main>
  );
}

function PersonaPicker({ onPick }: { onPick: (t: WorkspaceType) => void }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3 text-center">
        Step 1 of 2
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark text-center mb-3">
        How will you use ARLO?
      </h1>
      <p className="text-dark opacity-60 text-fluid-main text-center mb-10 max-w-xl mx-auto">
        This just tweaks the UI — same Claude connector either way. You can
        upgrade from Solo to an agency plan later in one click.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        <PersonaCard
          icon={<Building2 size={24} />}
          title="I run one business"
          subtitle="Solo · $19/mo"
          description="Plug Claude into your own analytics, ads, and store. Simplified single-business UI."
          bullets={[
            "1 business (your own)",
            "7 source types",
            "Up to 3 teammates",
            "Great for e-commerce, SaaS, local",
          ]}
          onClick={() => onPick("solo")}
          tone="orange"
        />
        <PersonaCard
          icon={<Users size={24} />}
          title="I'm an agency managing clients"
          subtitle="Studio / Agency / Scale"
          description="Full multi-client UI with per-client OAuth assignments and team audit logs."
          bullets={[
            "10 / 25 / 75 clients",
            "12 / 18 / ∞ source types",
            "Unlimited team members",
            "Great for boutique + mid-market agencies",
          ]}
          onClick={() => onPick("agency")}
          tone="neon"
          featured
        />
      </div>

      <p className="text-center mt-8 text-fluid-small text-dark opacity-50">
        Not sure? Pick what fits today — switching takes one click.
      </p>
    </div>
  );
}

function PersonaCard({
  icon,
  title,
  subtitle,
  description,
  bullets,
  onClick,
  tone,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  onClick: () => void;
  tone: "orange" | "neon";
  featured?: boolean;
}) {
  const toneBg = tone === "orange" ? "#FFCA94" : "#D0FF71";
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white border-2 rounded-lg p-6 hover:border-brand transition-colors ${
        featured ? "border-brand" : "border-dark-faded"
      }`}
    >
      <div
        className="w-10 h-10 rounded flex items-center justify-center text-dark mb-4"
        style={{ backgroundColor: toneBg }}
      >
        {icon}
      </div>
      <div className="flex items-baseline justify-between mb-1 gap-2">
        <h2 className="font-sans text-fluid-h5 text-dark">{title}</h2>
        {featured && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-brand bg-mint px-2 py-0.5 rounded">
            Most pick this
          </span>
        )}
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
        {subtitle}
      </p>
      <p className="text-dark text-fluid-main mb-5">{description}</p>
      <ul className="space-y-1.5 text-fluid-small text-dark opacity-80">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="text-brand mt-0.5">›</span>
            {b}
          </li>
        ))}
      </ul>
    </button>
  );
}

function NameStep({
  type,
  name,
  setName,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  type: WorkspaceType;
  name: string;
  setName: (s: string) => void;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  error: string | null;
}) {
  const label = type === "solo" ? "Your business name" : "Your agency name";
  const placeholder = type === "solo" ? "Tessellate Coffee" : "Northpoint Digital";
  const hint =
    type === "solo"
      ? "We'll use this as your single client — you can rename it later."
      : "Invite teammates and add clients once you're in.";

  return (
    <div className="bg-white border border-dark-faded rounded-lg p-10 shadow-sm">
      <button
        onClick={onBack}
        className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100 mb-6"
      >
        ← Back
      </button>
      <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3">
        Step 2 of 2
      </p>
      <h1 className="font-sans text-fluid-h3 text-dark mb-2">{label}</h1>
      <p className="text-dark opacity-60 mb-8 text-fluid-main">{hint}</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-dark block mb-2">
            {label}
          </label>
          <input
            id="name"
            type="text"
            placeholder={placeholder}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-dark-faded rounded px-4 py-3 font-sans text-fluid-main focus:outline-none focus:border-brand"
          />
        </div>

        {error && <p className="text-bg-red text-fluid-small font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full btn-secondary text-base py-4 disabled:opacity-40"
        >
          {submitting ? "Creating..." : type === "solo" ? "Launch my workspace" : "Create agency workspace"}
        </button>
      </form>
    </div>
  );
}

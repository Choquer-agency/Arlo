"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { ArloMark } from "@/components/ArloMark";

export default function WelcomePage() {
  const router = useRouter();
  const state = useQuery(api.provisioning.myProvisioningState);
  const complete = useAction(api.provisioning.completeProvisioning);
  const dismiss = useMutation(api.provisioning.dismissProvisioning);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If there's nothing to complete, this page isn't for them.
  useEffect(() => {
    if (state === null) router.replace("/sign-in");
    else if (state && !state.pending) router.replace("/dashboard");
  }, [state, router]);

  if (state === undefined || state === null || !state.pending) {
    return <div className="min-h-screen grid place-items-center bg-mint text-dark/40">Loading…</div>;
  }

  const daysLeft = state.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(state.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 30;

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      const res = await complete({ newPassword: password });
      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    if (!state?.workspaceId) return;
    setBusy(true);
    try {
      await dismiss({ workspaceId: state.workspaceId });
      router.replace("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-mint px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <ArloMark className="h-8 w-auto text-dark" /><span className="font-display text-fluid-h4 text-dark">ARLO</span>
        </div>

        <div className="bg-dark text-white rounded-lg p-6 mb-6">
          <p className="font-mono text-xs uppercase tracking-wider text-brand-lime mb-2 flex items-center gap-2">
            <Sparkles size={14} /> Welcome{state.businessName ? `, ${state.businessName}` : ""}
          </p>
          <h1 className="font-sans text-fluid-h4 leading-snug mb-2">
            Your account is ready — and your first {daysLeft} days are on us.
          </h1>
          <p className="text-white/70 text-sm">
            Arlo lets you ask Claude about your real marketing numbers — sessions, clicks,
            rankings — in plain English. Your team set this up for you. Pick a password and
            you&apos;re in.
          </p>
        </div>

        <form onSubmit={setNewPassword} className="bg-white border border-dark-faded rounded-lg p-7">
          <h2 className="font-sans text-fluid-h5 text-dark mb-1">Set your password</h2>
          <p className="text-dark/60 text-sm mb-5">
            You&apos;re signed in as <b>{state.email}</b>. Choose a password only you know.
          </p>
          <div className="space-y-3">
            <input
              type="password"
              autoComplete="new-password"
              placeholder="New password (8+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-dark-faded rounded px-4 py-3 focus:outline-none focus:border-brand"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-dark-faded rounded px-4 py-3 focus:outline-none focus:border-brand"
            />
            {error && <p className="text-bg-red text-sm">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-brand-lime text-dark py-3.5 rounded font-mono text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {busy ? "…" : <>Set password &amp; continue <ArrowRight size={15} /></>}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-dark-faded">
            <p className="font-mono text-[11px] uppercase tracking-wider text-dark/50 mb-3">
              What happens next
            </p>
            <ul className="space-y-2 text-sm text-dark/70">
              <NextItem>Connect your Google Analytics &amp; Search Console in a couple of clicks.</NextItem>
              <NextItem>See your real numbers on your dashboard.</NextItem>
              <NextItem>Connect Claude and just ask questions in plain English.</NextItem>
            </ul>
          </div>

          <button
            type="button"
            onClick={skip}
            disabled={busy}
            className="w-full mt-4 text-dark/40 hover:text-dark/70 text-xs font-mono uppercase tracking-wider"
          >
            Skip for now
          </button>
        </form>
      </div>
    </main>
  );
}

function NextItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={15} className="text-brand mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

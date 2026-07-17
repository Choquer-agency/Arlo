"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArloMark } from "@/components/ArloMark";

/** Only allow same-origin relative paths as a post-login redirect target. */
function safeRedirectTo(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

/**
 * The sign-in / sign-up card. Shared by /sign-in and /sign-up so both pages
 * carry the marketing-grade UI (serif heading, periwinkle mark, soft fields).
 * Sign-up collects name + company (company seeds the workspace in onboarding)
 * and a confirm-password field. `mode` is fixed by the page; the switch link
 * navigates to the other page.
 */
export function SignInCard({ mode }: { mode: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirectTo(params.get("redirectTo"));
  const isSignUp = mode === "signUp";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape hatch for accounts originally created with Google:
  // /sign-in?provider=google auto-starts the Google flow.
  const googleStarted = useRef(false);
  useEffect(() => {
    if (params.get("provider") === "google" && !googleStarted.current) {
      googleStarted.current = true;
      signIn("google", { redirectTo });
    }
  }, [params, redirectTo, signIn]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSignUp && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (isSignUp && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: isSignUp ? "signUp" : "signIn",
      });
      if (isSignUp) {
        // New accounts go through onboarding. Carry the company (→ workspace
        // name) and first name so onboarding can greet + prefill without a
        // round-trip to the backend.
        const q = new URLSearchParams();
        if (company.trim()) q.set("company", company.trim());
        if (firstName.trim()) q.set("first", firstName.trim());
        if (lastName.trim()) q.set("last", lastName.trim());
        router.push(`/onboarding${q.toString() ? `?${q}` : ""}`);
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError(
        isSignUp
          ? "Couldn't create that account. It may already exist — try signing in."
          : "That email and password don't match. Check with whoever set up your account."
      );
    } finally {
      setBusy(false);
    }
  }

  const switchQuery = new URLSearchParams();
  if (params.get("redirectTo")) switchQuery.set("redirectTo", params.get("redirectTo")!);
  if (email) switchQuery.set("email", email);
  const switchHref = `${isSignUp ? "/sign-in" : "/sign-up"}${
    switchQuery.toString() ? `?${switchQuery.toString()}` : ""
  }`;

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white/90 px-4 py-3 text-[0.95rem] text-[#14181c] placeholder:text-[#14181c]/30 shadow-sm focus:outline-none focus:border-[#8F93FF] focus:ring-2 focus:ring-[#8F93FF]/20 transition-all";
  const labelClass = "block text-sm font-medium text-[#14181c] mb-1.5";

  return (
    <div className="relative z-10 w-full max-w-[420px] text-center">
      <div className="flex justify-center mb-5">
        <ArloMark className="h-9 w-auto text-[#8F93FF]" />
      </div>
      <h1 className="font-serif font-normal text-[2.1rem] leading-[1.1] tracking-[-0.04em] text-[#14181c] mb-2">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>
      <p className="text-[#14181c]/55 mb-7">Ask Claude about any client, any platform.</p>

      <form onSubmit={submit} className="space-y-3 text-left">
        {isSignUp && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First name</label>
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Jordan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder="Rivera"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input
                type="text"
                required
                autoComplete="organization"
                placeholder="Northpoint Digital"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            required
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        {isSignUp && (
          <div>
            <label className={labelClass}>Confirm password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`${inputClass} ${
                confirm.length > 0
                  ? password === confirm
                    ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                    : "border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/15"
                  : ""
              }`}
            />
            {confirm.length > 0 && (
              <p
                className={`mt-1.5 text-xs font-medium ${
                  password === confirm ? "text-emerald-600" : "text-[#c0392b]"
                }`}
              >
                {password === confirm ? "✓ Passwords match" : "Passwords don't match"}
              </p>
            )}
          </div>
        )}
        {error && <p className="text-[#c0392b] text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy || (isSignUp && (password.length === 0 || password !== confirm))}
          className="w-full flex items-center justify-center text-center rounded-lg bg-[#14181c] text-white py-3.5 text-[0.95rem] font-medium hover:brightness-150 disabled:opacity-50 transition-all"
        >
          {busy ? "…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-[0.95rem] text-[#14181c]/60 mt-5">
        {isSignUp ? "Already have an account?" : "New here?"}{" "}
        <Link href={switchHref} className="text-[#14181c] font-medium underline underline-offset-2">
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>

      <p className="text-sm text-[#14181c]/40 mt-6">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}

/** Full-page gradient backdrop (mirrors the old popup's fx) + centered card. */
export function SignInShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-12 overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            filter: "blur(48px) saturate(1.2)",
            transform: "scale(1.2)",
            background:
              "radial-gradient(55% 55% at 28% 30%, #e7efe0 0%, transparent 60%), radial-gradient(50% 50% at 75% 68%, #eae6ff 0%, transparent 60%), #eef0ea",
          }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.62)" }} />
      </div>
      {children}
    </main>
  );
}

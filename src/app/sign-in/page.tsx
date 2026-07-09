"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArloMark } from "@/components/ArloMark";

/** Only allow same-origin relative paths as a post-login redirect target. */
function safeRedirectTo(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export default function SignInPage() {
  // Guard: Convex hooks crash when no ConvexProvider is wrapping the tree.
  // That only happens when NEXT_PUBLIC_CONVEX_URL is set. Render a helpful
  // placeholder instead of calling the hook so the marketing site works without
  // Convex deployed.
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <ConvexNotConfigured />;
  }
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function ConvexNotConfigured() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-mint px-6">
      <div className="w-full max-w-md bg-white border border-dark-faded rounded-lg p-10 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-dark mb-8"><ArloMark className="h-8 w-auto" /><span className="font-display text-fluid-h4">ARLO</span></Link>
        <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3">
          Setup required
        </p>
        <h1 className="font-sans text-fluid-h3 text-dark mb-3">
          Sign-in is not live yet
        </h1>
        <p className="text-dark opacity-60 text-fluid-main mb-6">
          You&apos;re running the ARLO app without a Convex backend deployed. Sign-in goes
          live as soon as Convex is wired:
        </p>
        <ol className="space-y-3 text-fluid-main text-dark opacity-80 mb-8">
          <li>
            <span className="font-mono text-xs text-brand mr-2">01</span>
            In a terminal at{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-sm">website/</code>, run:{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-sm">
              npx convex dev
            </code>
          </li>
          <li>
            <span className="font-mono text-xs text-brand mr-2">02</span>
            Follow the prompts — a{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-sm">
              NEXT_PUBLIC_CONVEX_URL
            </code>{" "}
            lands in your{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-sm">
              .env.local
            </code>
          </li>
          <li>
            <span className="font-mono text-xs text-brand mr-2">03</span>
            Generate auth keys with{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-sm">
              npx @convex-dev/auth
            </code>
          </li>
          <li>
            <span className="font-mono text-xs text-brand mr-2">04</span>
            Restart{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-sm">
              npm run dev
            </code>{" "}
            — this page becomes functional.
          </li>
        </ol>
        <p className="text-fluid-small text-dark opacity-40">
          Want to test Stripe checkout without signing in?{" "}
          <Link href="/#pricing" className="underline underline-offset-2">
            Pick a plan
          </Link>{" "}
          from the landing page — guest checkout works today.
        </p>
      </div>
    </main>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirectTo(params.get("redirectTo"));

  const [mode, setMode] = useState<"signIn" | "signUp">(
    params.get("mode") === "signup" ? "signUp" : "signIn"
  );
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handoff from the static-shell sign-in popup: ?provider=google auto-starts
  // the Google flow so "Continue with Google" there feels inline. Runs once.
  const googleStarted = useRef(false);
  useEffect(() => {
    if (params.get("provider") === "google" && !googleStarted.current) {
      googleStarted.current = true;
      signIn("google", { redirectTo });
    }
  }, [params, redirectTo, signIn]);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn("password", { email: email.trim().toLowerCase(), password, flow: mode });
      router.push(redirectTo);
    } catch {
      setError(
        mode === "signIn"
          ? "That email and password don't match. Check with whoever set up your account."
          : "Couldn't create that account. It may already exist — try signing in."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-mint px-6 py-12">
      <div className="w-full max-w-md bg-white border border-dark-faded rounded-lg p-10 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-dark mb-8"><ArloMark className="h-8 w-auto" /><span className="font-display text-fluid-h4">ARLO</span></Link>
        <h1 className="font-sans text-fluid-h3 text-dark mb-3">
          {mode === "signIn" ? "Sign in" : "Create your account"}
        </h1>
        <p className="text-dark opacity-60 mb-8 text-fluid-main">
          Ask Claude about any client, any platform.
        </p>

        {/* Google sign-in is paused while OAuth verification is pending —
            email/password only. The ?provider=google handoff above still works
            as an escape hatch for accounts originally created with Google. */}
        <form onSubmit={submitPassword} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-dark-faded rounded px-4 py-3 text-fluid-main focus:outline-none focus:border-brand"
          />
          <input
            type="password"
            required
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-dark-faded rounded px-4 py-3 text-fluid-main focus:outline-none focus:border-brand"
          />
          {error && <p className="text-bg-red text-sm">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-dark text-white py-3.5 rounded font-mono text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "…" : mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-fluid-small text-dark/60 mt-5 text-center">
          {mode === "signIn" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signIn" ? "signUp" : "signIn");
              setError(null);
            }}
            className="text-brand underline"
          >
            {mode === "signIn" ? "Create an account" : "Sign in"}
          </button>
        </p>

        <p className="text-fluid-small text-dark opacity-40 mt-6 text-center">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}

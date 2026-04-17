"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";

export default function SignInPage() {
  // Guard: Convex hooks crash when no ConvexProvider is wrapping the tree.
  // That only happens when NEXT_PUBLIC_CONVEX_URL is set. Render a helpful
  // placeholder instead of calling the hook so the marketing site works without
  // Convex deployed.
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <ConvexNotConfigured />;
  }
  return <SignInForm />;
}

function ConvexNotConfigured() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-mint px-6">
      <div className="w-full max-w-md bg-white border border-dark-faded rounded-lg p-10 shadow-sm">
        <Link
          href="/"
          className="font-display text-fluid-h4 text-dark block mb-8"
        >
          ARLO
        </Link>
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-mint px-6">
      <div className="w-full max-w-md bg-white border border-dark-faded rounded-lg p-10 shadow-sm">
        <Link href="/" className="font-display text-fluid-h4 text-dark block mb-8">
          ARLO
        </Link>
        <h1 className="font-sans text-fluid-h3 text-dark mb-3">Sign in</h1>
        <p className="text-dark opacity-60 mb-8 text-fluid-main">
          Ask Claude about any client, any platform.
        </p>

        <button
          onClick={() => signIn("google", { redirectTo: "/dashboard" })}
          className="w-full btn-secondary text-base py-4 flex items-center justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-fluid-small text-dark opacity-40 mt-8 text-center">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

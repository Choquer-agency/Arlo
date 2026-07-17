"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArloMark } from "@/components/ArloMark";
import { SignInCard, SignInShell } from "@/components/SignInCard";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <ConvexNotConfigured />;
  }
  return (
    <SignInShell>
      <Suspense fallback={null}>
        <SignInCard mode="signUp" />
      </Suspense>
    </SignInShell>
  );
}

function ConvexNotConfigured() {
  return (
    <SignInShell>
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white/90 backdrop-blur-md p-8 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <ArloMark className="h-9 w-auto text-[#8F93FF]" />
        </div>
        <h1 className="font-serif text-2xl text-[#14181c] mb-2">Sign-up isn&apos;t live yet</h1>
        <p className="text-[#14181c]/60 mb-2">
          The auth backend isn&apos;t connected in this environment.
        </p>
        <Link href="/" className="underline text-[#14181c] font-medium">
          Back to home
        </Link>
      </div>
    </SignInShell>
  );
}

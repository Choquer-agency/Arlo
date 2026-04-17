"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function TopBar() {
  const { signOut } = useAuthActions();

  return (
    <header className="h-8 flex items-center justify-end px-4">
      <button
        onClick={() => signOut()}
        className="font-mono text-xs uppercase tracking-wider text-dark/60 hover:text-dark"
      >
        Sign out
      </button>
    </header>
  );
}

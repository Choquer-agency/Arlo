"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ArloMark } from "@/components/ArloMark";
import { useSignInModal } from "@/context/SignInModalContext";

// Mount the ARLO "chrome" water shader across `target`, fed a soft floral image,
// then keep its WebGL buffer sized to the element. Mirrors public/arlo/arlo-chat.js
// so the blurred blobs look identical to the marketing pages. Returns a cleanup fn.
function mountChrome(target: HTMLElement): () => void {
  let disposed = false;
  let instance: { setSpeed?: (n: number) => void } | null = null;
  let onResize: (() => void) | null = null;

  function start() {
    const AC = (window as unknown as { ArloChrome?: { mount: (el: HTMLElement, img: HTMLImageElement, p: Record<string, unknown>) => unknown } }).ArloChrome;
    if (!AC || disposed) return;
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      try {
        const m = AC.mount(target, img, {
          colorBack: "#cfcabf",
          colorHighlight: "#ffffff",
          highlights: 0.06,
          layering: 0.5,
          edges: 0.8,
          waves: 0.55,
          caustic: 0.22,
          size: 1.5,
          speed: 0.3,
          scale: 1.15,
          fit: "cover",
        }) as {
          parentWidth?: number;
          parentHeight?: number;
          parentDevicePixelWidth?: number;
          parentDevicePixelHeight?: number;
          devicePixelsSupported?: boolean;
          handleResize?: () => void;
        };
        instance = m as typeof instance;
        const sizeIt = () => {
          const r = target.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const dpr = Math.max(1, window.devicePixelRatio);
          m.parentWidth = r.width;
          m.parentHeight = r.height;
          m.parentDevicePixelWidth = r.width * dpr;
          m.parentDevicePixelHeight = r.height * dpr;
          m.devicePixelsSupported = true;
          m.handleResize?.();
        };
        requestAnimationFrame(sizeIt);
        [120, 500, 1200].forEach((d) => setTimeout(sizeIt, d));
        onResize = sizeIt;
        window.addEventListener("resize", sizeIt, { passive: true });
      } catch {
        /* WebGL unsupported — the CSS gradient underneath stands in. */
      }
    };
    img.src = "/arlo/bg/wildflowers.webp";
  }

  const existing = (window as unknown as { ArloChrome?: unknown }).ArloChrome;
  if (existing) {
    start();
  } else {
    const id = "arlo-water-js";
    let s = document.getElementById(id) as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.src = "/arlo/lib/arlo-water.js";
      s.defer = true;
      document.body.appendChild(s);
    }
    s.addEventListener("load", start);
  }

  return () => {
    disposed = true;
    if (onResize) window.removeEventListener("resize", onResize);
    const inst = instance as { dispose?: () => void; setSpeed?: (n: number) => void } | null;
    inst?.dispose?.();
    // Remove any canvas the shader prepended so re-opening doesn't stack them.
    target.querySelectorAll("canvas").forEach((c) => c.remove());
    target.removeAttribute("data-paper-shader");
  };
}

export function SignInModal() {
  const { isOpen } = useSignInModal();
  // Convex hooks crash without a provider (only present when NEXT_PUBLIC_CONVEX_URL
  // is set). Marketing pages must still work uncconfigured, so guard like /sign-in.
  if (!isOpen) return null;
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return <ModalShell configured={false} />;
  return <ModalShell configured />;
}

function ModalShell({ configured }: { configured: boolean }) {
  const { close, initialMode } = useSignInModal();
  const bgRef = useRef<HTMLDivElement>(null);

  // scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  // chrome background
  useEffect(() => {
    if (!bgRef.current) return;
    return mountChrome(bgRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center px-5 py-10 overflow-y-auto">
      {/* animated chrome background — full viewport, heavily blurred + darkened */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div
          ref={bgRef}
          className="absolute inset-0"
          style={{
            filter: "blur(48px) saturate(1.2)",
            transform: "scale(1.2)",
            background:
              "radial-gradient(55% 55% at 28% 30%, #e7efe0 0%, transparent 60%), radial-gradient(50% 50% at 75% 68%, #eae6ff 0%, transparent 60%), #eef0ea",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255,255,255,0.62)" }}
        />
      </div>

      <button
        onClick={close}
        aria-label="Close"
        className="absolute top-5 right-5 z-10 grid place-items-center h-10 w-10 rounded-full bg-black/[0.06] text-[#14181c]/60 hover:text-[#14181c] hover:bg-black/10 transition-colors backdrop-blur-md"
      >
        <X size={18} />
      </button>

      <div className="relative z-10 w-full max-w-[420px] text-center">
        {configured ? (
          <SignInForm initialMode={initialMode} onDone={close} />
        ) : (
          <ConfiguredFallback />
        )}
      </div>
    </div>
  );
}

function SignInForm({
  initialMode,
  onDone,
}: {
  initialMode: "signIn" | "signUp";
  onDone: () => void;
}) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const redirectTo = "/dashboard";

  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn("password", { email: email.trim().toLowerCase(), password, flow: mode });
      onDone();
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

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white/90 px-4 py-3 text-[0.95rem] text-[#14181c] placeholder:text-[#14181c]/30 shadow-sm focus:outline-none focus:border-[#193133] focus:ring-2 focus:ring-[#193133]/15 transition-all";

  return (
    <div>
      <div className="flex justify-center mb-5">
        <ArloMark className="h-9 w-auto text-[#8F93FF]" />
      </div>
      <h1 className="font-serif font-normal text-[2.1rem] leading-[1.1] tracking-[-0.04em] text-[#14181c] mb-2">
        {mode === "signIn" ? "Sign in" : "Create your account"}
      </h1>
      <p className="text-[#14181c]/55 mb-7">Ask Claude about any client, any platform.</p>

      {/* Google sign-in paused while OAuth verification is pending — email only. */}
      <form onSubmit={submitPassword} className="space-y-3 text-left">
        <div>
          <label className="block text-sm font-medium text-[#14181c] mb-1.5">Email</label>
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
          <label className="block text-sm font-medium text-[#14181c] mb-1.5">Password</label>
          <input
            type="password"
            required
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-[#c0392b] text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-[#193133] text-white py-3.5 text-[0.95rem] font-medium hover:brightness-125 disabled:opacity-50 transition-all"
        >
          {busy ? "…" : mode === "signIn" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="text-[0.95rem] text-[#14181c]/60 mt-5">
        {mode === "signIn" ? "New here?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="text-[#14181c] font-medium underline underline-offset-2"
        >
          {mode === "signIn" ? "Create an account" : "Sign in"}
        </button>
      </p>

      <p className="text-sm text-[#14181c]/40 mt-6">
        By continuing you agree to our{" "}
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
  );
}

function ConfiguredFallback() {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8">
      <div className="flex justify-center mb-4">
        <ArloMark className="h-9 w-auto text-[#14181c]" />
      </div>
      <h1 className="font-serif text-2xl text-[#14181c] mb-2">Sign-in isn&apos;t live yet</h1>
      <p className="text-[#14181c]/60 mb-4">
        The auth backend isn&apos;t connected in this environment.
      </p>
      <Link href="/sign-in" className="underline text-[#14181c] font-medium">
        Go to the sign-in page
      </Link>
    </div>
  );
}

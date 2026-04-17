import { ReactNode } from "react";
import { UpgradeBanner } from "./UpgradeBanner";
import { getMaxedStatus } from "@/lib/demoUsage";

export function AppShell({
  sidebar,
  topBar,
  children,
}: {
  sidebar: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
}) {
  const maxed = getMaxedStatus();
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8ebe9]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-32 h-[42rem] w-[42rem] rounded-full bg-brand-neon/35 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[44rem] w-[44rem] rounded-full bg-brand-accent/30 blur-3xl" />
        <div className="absolute -bottom-48 left-1/4 h-[40rem] w-[40rem] rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute top-1/4 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-mint/60 blur-3xl" />
      </div>

      <div className="flex min-h-screen p-3 gap-3">
        {sidebar}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {topBar}
          {maxed && <UpgradeBanner status={maxed} />}
          <main className="flex-1 rounded-2xl bg-grey border border-white/60 shadow-[0_8px_30px_rgba(25,49,51,0.08)] p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ProvisioningGate } from "@/components/app/ProvisioningGate";
import { TrialBanner } from "@/components/app/TrialBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <ProvisioningGate />
      <AppShell sidebar={<Sidebar />} topBar={<TopBar />}>
        <TrialBanner />
        {children}
      </AppShell>
    </PostHogProvider>
  );
}

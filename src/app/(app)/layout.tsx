import { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ActingWorkspaceProvider } from "@/components/providers/ActingWorkspaceProvider";
import { ProvisioningGate } from "@/components/app/ProvisioningGate";
import { TrialBanner } from "@/components/app/TrialBanner";
import { ImpersonationBanner } from "@/components/app/ImpersonationBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ActingWorkspaceProvider>
      <PostHogProvider>
        <ProvisioningGate />
        <ImpersonationBanner />
        <AppShell sidebar={<Sidebar />} topBar={<TopBar />}>
          <TrialBanner />
          {children}
        </AppShell>
      </PostHogProvider>
    </ActingWorkspaceProvider>
  );
}

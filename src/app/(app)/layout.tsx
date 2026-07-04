import { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <AppShell sidebar={<Sidebar />} topBar={<TopBar />}>
        {children}
      </AppShell>
    </PostHogProvider>
  );
}

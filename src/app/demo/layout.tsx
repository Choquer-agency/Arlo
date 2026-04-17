import { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { DemoSidebar } from "@/components/app/DemoSidebar";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell sidebar={<DemoSidebar />}>{children}</AppShell>
  );
}

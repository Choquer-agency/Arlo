"use client";

import { useRouter } from "next/navigation";
import { Eye, X } from "lucide-react";
import { useActiveWorkspace, useActing } from "@/components/providers/ActingWorkspaceProvider";

/**
 * Persistent bar shown while an admin is acting inside a client workspace, so
 * it's always obvious you're not in your own account. Exit returns to /admin.
 */
export function ImpersonationBanner() {
  const { ws, impersonating } = useActiveWorkspace();
  const { exit } = useActing();
  const router = useRouter();
  if (!impersonating || !ws) return null;

  return (
    <div className="sticky top-0 z-40 bg-dark text-white flex items-center justify-center gap-3 px-4 py-2 text-sm">
      <Eye size={15} className="text-brand-lime shrink-0" />
      <span className="truncate">
        Viewing <b>{ws.name}</b> as admin — you&apos;re seeing exactly what this client sees.
      </span>
      <button
        onClick={() => {
          exit();
          router.push("/admin");
        }}
        className="ml-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider bg-brand-lime text-dark px-2.5 py-1 rounded hover:opacity-90 shrink-0"
      >
        <X size={12} /> Exit
      </button>
    </div>
  );
}

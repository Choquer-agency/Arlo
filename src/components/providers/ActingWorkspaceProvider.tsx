"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const STORAGE_KEY = "arlo_acting_ws";

type ActingContextValue = {
  actingWorkspaceId: Id<"workspaces"> | null;
  enter: (id: Id<"workspaces">) => void;
  exit: () => void;
};

const ActingContext = createContext<ActingContextValue>({
  actingWorkspaceId: null,
  enter: () => {},
  exit: () => {},
});

/**
 * Holds the "acting as" workspace an Arlo admin has entered (persisted in
 * localStorage so it survives navigation/refresh). When set, useActiveWorkspace
 * resolves the whole app onto that client's workspace.
 */
export function ActingWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [actingWorkspaceId, setId] = useState<Id<"workspaces"> | null>(null);

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) setId(v as Id<"workspaces">);
  }, []);

  const enter = useCallback((id: Id<"workspaces">) => {
    localStorage.setItem(STORAGE_KEY, id);
    setId(id);
  }, []);

  const exit = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setId(null);
  }, []);

  return (
    <ActingContext.Provider value={{ actingWorkspaceId, enter, exit }}>
      {children}
    </ActingContext.Provider>
  );
}

export function useActing() {
  return useContext(ActingContext);
}

/**
 * The workspace the app should operate on: the user's own, or a client's when an
 * admin has "entered" it. `ws` is undefined while loading, null if none.
 */
export function useActiveWorkspace() {
  const { actingWorkspaceId } = useActing();
  const ws = useQuery(
    api.workspaces.resolveActive,
    actingWorkspaceId ? { actingWorkspaceId } : {}
  );
  return {
    ws,
    impersonating: !!(ws && "impersonating" in ws && ws.impersonating),
    actingWorkspaceId,
  };
}

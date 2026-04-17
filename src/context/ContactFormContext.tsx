"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { trackFormOpen } from "@/lib/analytics";

export type ContactFormMode = "general" | "enterprise";

export interface PackageInfo {
  packageName: string;
  pageCount: number;
  estimatedTotal: string;
  calculatorDetails?: string;
}

interface ContactFormContextValue {
  isOpen: boolean;
  mode: ContactFormMode;
  packageInfo: PackageInfo | null;
  openModal: (
    packageInfo?: PackageInfo | null,
    source?: string,
    mode?: ContactFormMode
  ) => void;
  closeModal: () => void;
}

const ContactFormContext = createContext<ContactFormContextValue>({
  isOpen: false,
  mode: "general",
  openModal: () => {},
  closeModal: () => {},
  packageInfo: null,
});

export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ContactFormMode>("general");
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);

  const openModal = useCallback(
    (info?: PackageInfo | null, source?: string, nextMode?: ContactFormMode) => {
      trackFormOpen(
        source,
        info ? { packageName: info.packageName, estimatedTotal: info.estimatedTotal } : undefined
      );
      setPackageInfo(info ?? null);
      setMode(nextMode ?? "general");
      setIsOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <ContactFormContext.Provider
      value={{ isOpen, mode, openModal, closeModal, packageInfo }}
    >
      {children}
    </ContactFormContext.Provider>
  );
}

export function useContactForm() {
  return useContext(ContactFormContext);
}

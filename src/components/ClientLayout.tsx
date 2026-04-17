"use client";

import { ReactNode } from "react";
import { ContactFormProvider } from "@/context/ContactFormContext";
import { ContactFormModal } from "@/components/ContactForm";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ContactFormProvider>
      {children}
      <ContactFormModal />
    </ContactFormProvider>
  );
}

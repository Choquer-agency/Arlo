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
      {/* ARLO reskin canvas: warm cream base for every marketing page (app pages
          don't use ClientLayout, so their white background is unaffected). */}
      <div className="bg-[#F4F3EE] min-h-screen">{children}</div>
      <ContactFormModal />
    </ContactFormProvider>
  );
}

"use client";

import { ReactNode } from "react";
import { ContactFormProvider } from "@/context/ContactFormContext";
import { ContactFormModal } from "@/components/ContactForm";
import { SignInModalProvider } from "@/context/SignInModalContext";
import { SignInModal } from "@/components/SignInModal";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ContactFormProvider>
      <SignInModalProvider>
        {/* ARLO reskin canvas: warm cream base for every marketing page (app pages
            don't use ClientLayout, so their white background is unaffected). */}
        <div className="bg-[#F4F3EE] min-h-screen">{children}</div>
        <ContactFormModal />
        <SignInModal />
      </SignInModalProvider>
    </ContactFormProvider>
  );
}

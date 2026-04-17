"use client";

import { useEffect } from "react";
import { useContactForm } from "@/context/ContactFormContext";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const { openModal } = useContactForm();

  // Auto-open the general (not enterprise) question form when this page loads
  useEffect(() => {
    openModal(null, "contact_page", "general");
  }, [openModal]);

  return (
    <ClientLayout>
      <Nav />
      <div className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container text-center">
          <p className="eyebrow text-brand mb-4">Questions</p>
          <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] tracking-tight text-dark max-w-[22ch] mx-auto mb-6">
            Ask us anything about ARLO.
          </h1>
          <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[48ch] mx-auto leading-relaxed">
            Your question form should have opened. If not, click the button below — we reply
            inside one business day.
          </p>
          <button
            onClick={() => openModal(null, "contact_page", "general")}
            className="mt-8 inline-flex items-center gap-3 rounded-sm px-8 py-4 font-sans font-medium text-fluid-main transition-all hover:brightness-110"
            style={{ background: "#D0FF71", color: "#193133" }}
          >
            Ask a question
          </button>
          <p className="font-sans text-fluid-small text-dark opacity-40 mt-10">
            Ready to sign up?{" "}
            <a href="/sign-in" className="underline underline-offset-2">
              Start for free
            </a>{" "}
            — 14-day trial, no card.
          </p>
        </div>
      </div>
      <Footer />
    </ClientLayout>
  );
}

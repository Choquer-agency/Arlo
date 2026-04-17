"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { faqs } from "@/content/shared";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { FAQItem } from "@/content/config";
import { trackFaqToggle } from "@/lib/analytics";

interface FAQProps {
  items?: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const ref = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqItems = items || faqs;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".faq-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".faq-item", {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="faq" className="section-space-main">
      <div className="u-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="faq-heading eyebrow text-brand mb-4">FAQ</p>
            <h2 className="faq-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark">
              Common questions
            </h2>
          </div>

          <div className="space-y-0">
            {faqItems.map((faq, i) => (
              <div
                key={faq.question}
                className="faq-item border-b border-dark-faded"
              >
                <button
                  onClick={() => {
                    if (openIndex !== i) trackFaqToggle(faq.question, i);
                    setOpenIndex(openIndex === i ? null : i);
                  }}
                  className="w-full flex items-center justify-between py-5 text-left gap-4"
                >
                  <span className="font-sans font-medium text-fluid-main text-dark">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={clsx(
                      "flex-shrink-0 text-dark opacity-40 transition-transform",
                      openIndex === i && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={clsx(
                    "overflow-hidden transition-all",
                    openIndex === i ? "max-h-[500px] pb-5" : "max-h-0"
                  )}
                  style={{ transitionDuration: "0.3s" }}
                >
                  <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

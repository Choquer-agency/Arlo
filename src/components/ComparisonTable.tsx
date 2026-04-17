"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { comparisonRows } from "@/content/shared";
import { Check, X } from "lucide-react";

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} className="text-green-600" />
    ) : (
      <X size={18} className="text-red-400" />
    );
  }
  return <span>{value}</span>;
}

export function ComparisonTable() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".comparison-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".comparison-table", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="section-space-main">
      <div className="u-container">
        <div className="text-center mb-12">
          <p className="comparison-heading eyebrow text-brand mb-4">
            The Comparison
          </p>
          <h2 className="comparison-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[22ch] mx-auto">
            Custom software vs. SaaS subscriptions
          </h2>
        </div>

        <div className="comparison-table max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-dark">
                <th className="text-left font-sans font-medium text-fluid-main text-dark py-4 pr-6">
                  Feature
                </th>
                <th className="text-left font-sans font-medium text-fluid-main py-4 px-6 text-brand">
                  Custom Build
                </th>
                <th className="text-left font-sans font-medium text-fluid-main text-dark opacity-50 py-4 pl-6">
                  SaaS Subscription
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-dark-faded"
                >
                  <td className="font-sans text-fluid-main text-dark py-4 pr-6">
                    {row.feature}
                  </td>
                  <td className="font-sans text-fluid-main text-dark py-4 px-6">
                    <CellValue value={row.custom} />
                  </td>
                  <td className="font-sans text-fluid-main text-dark opacity-50 py-4 pl-6">
                    <CellValue value={row.saas} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

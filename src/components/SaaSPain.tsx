"use client";

import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { saasProblems } from "@/content/shared";

/** Parse a stat string into segments of text and numbers, e.g.
 *  "$75K–$1.5M" → ["$", 75, "K–$", 1.5, "M"] */
function parseStatSegments(stat: string) {
  const segments: { type: "text" | "number"; value: string | number; decimals: number }[] = [];
  const regex = /(\d+\.?\d*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(stat)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: stat.slice(lastIndex, match.index), decimals: 0 });
    }
    const raw = match[1];
    const decimalIndex = raw.indexOf(".");
    const decimals = decimalIndex >= 0 ? raw.length - decimalIndex - 1 : 0;
    segments.push({ type: "number", value: parseFloat(raw), decimals });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < stat.length) {
    segments.push({ type: "text", value: stat.slice(lastIndex), decimals: 0 });
  }

  return segments;
}

function CountUpStat({ stat }: { stat: string }) {
  const segments = parseStatSegments(stat);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const setRef = useCallback(
    (el: HTMLSpanElement | null, i: number) => {
      spanRefs.current[i] = el;
    },
    []
  );

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      segments.forEach((seg, i) => {
        if (seg.type !== "number" || !spanRefs.current[i]) return;
        const el = spanRefs.current[i]!;
        const target = seg.value as number;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = obj.val.toFixed(seg.decimals);
          },
        });
      });
    });
  }, []);

  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span key={i} ref={(el) => setRef(el, i)}>
            0
          </span>
        )
      )}
    </>
  );
}

export function SaaSPain() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".saas-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".saas-card", {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
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
        <div className="text-center mb-16">
          <p className="saas-heading eyebrow text-brand mb-4">The Problem</p>
          <h2 className="saas-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[24ch] mx-auto mb-6">
            Your SaaS subscriptions are a growing liability.{" "}
            <span style={{ color: "#27EAA6" }}>
              Not an asset.
            </span>
          </h2>
          <p className="saas-heading font-sans text-fluid-main text-dark opacity-50 leading-relaxed max-w-[50ch] mx-auto">
            Every year, prices go up. Features you don&apos;t use multiply. And you own
            none of it. There&apos;s a better way.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          {saasProblems.map((problem) => (
            <div
              key={problem.label}
              className="saas-card p-6"
            >
              <p className="font-display mb-3 whitespace-nowrap" style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)", lineHeight: 1, color: "#27EAA6" }}>
                <CountUpStat stat={problem.stat} />
              </p>
              <p className="font-sans font-medium text-fluid-h6 text-dark mb-3">
                {problem.label}
              </p>
              <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

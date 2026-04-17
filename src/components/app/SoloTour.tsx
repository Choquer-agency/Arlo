"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, X, Sparkles } from "lucide-react";

type TourStep = {
  title: string;
  body: string;
  selector: string | null;
};

const STEPS: TourStep[] = [
  {
    title: "This is your dashboard",
    body:
      "Everything happens here. Arlo pulls from your live sources so you never read stale reports — ask Claude anything, anytime.",
    selector: "[data-tour='dashboard']",
  },
  {
    title: "Your MCP URL — the critical piece",
    body:
      "This is how you connect Claude Desktop to your data. Copy this URL into Claude once, and every question you ask routes through Arlo.",
    selector: "[data-tour='mcp-url']",
  },
  {
    title: "Prompt library",
    body:
      "60+ starter prompts — basics and advanced cross-platform questions an agency owner would ask. Copy any one into Claude.",
    selector: "[data-tour='prompts']",
  },
  {
    title: "Connections",
    body:
      "Your data sources live here. You can add more anytime — Meta Ads, TikTok, Stripe, and 100+ others.",
    selector: "[data-tour='connections']",
  },
  {
    title: "Invite your team",
    body:
      "Solo includes 3 seats. Bring in your bookkeeper or marketing help — everyone gets the same access.",
    selector: "[data-tour='team']",
  },
];

type Props = {
  onComplete: () => void;
};

export function SoloTour({ onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[stepIdx];

  useEffect(() => {
    function update() {
      if (!step.selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.selector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect(r);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [stepIdx, step.selector]);

  function next() {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else onComplete();
  }
  function prev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  return (
    <>
      {/* Dim backdrop with cut-out around target via massive box-shadow */}
      {rect ? (
        <div
          className="fixed z-40 pointer-events-none rounded-xl transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(25, 49, 51, 0.55)",
            border: "2px solid #D0FF71",
          }}
        />
      ) : (
        <div className="fixed inset-0 z-40 bg-dark/55 pointer-events-none" />
      )}

      {/* Teaching card */}
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-dark-faded overflow-hidden">
        <div className="bg-dark text-brand-lime px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            <p className="font-mono text-[11px] uppercase tracking-wider">
              Tour · {stepIdx + 1} of {STEPS.length}
            </p>
          </div>
          <button
            onClick={onComplete}
            className="text-brand-lime/70 hover:text-brand-lime"
            aria-label="Skip tour"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-sans text-fluid-h5 text-dark mb-2">{step.title}</h3>
          <p className="text-dark/70 text-sm mb-4">{step.body}</p>

          <div className="flex gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= stepIdx ? "bg-brand-lime" : "bg-dark/10"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prev}
              disabled={stepIdx === 0}
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider ${
                stepIdx === 0 ? "text-dark/30 cursor-not-allowed" : "text-dark/60 hover:text-dark"
              }`}
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              onClick={onComplete}
              className="font-mono text-[11px] uppercase tracking-wider text-dark/50 hover:text-dark"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="btn-secondary !px-4 !py-2 text-[11px] inline-flex items-center gap-1.5"
            >
              {stepIdx === STEPS.length - 1 ? "Finish" : "Next"}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";

interface PixelRevealProps {
  children: ReactNode;
  /** Play immediately on mount (for hero). Default: scroll-triggered. */
  immediate?: boolean;
  /** How long the resolve takes in seconds. Default: 0.6 */
  duration?: number;
  /** Starting blur in px (higher = chunkier). Default: 10 */
  intensity?: number;
}

/**
 * Pixel-reveal scroll animation.
 *
 * Content starts blurred and resolves in discrete stepped frames,
 * mimicking pixels snapping into focus. Uses a manual stepped
 * approach to guarantee the visual effect fires.
 */
export function PixelReveal({
  children,
  immediate = false,
  duration = 0.6,
  intensity = 10,
}: PixelRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current;
        if (!el) return;

        // Build blur steps from heavy → clear
        const steps = [intensity, intensity * 0.7, intensity * 0.45, intensity * 0.25, intensity * 0.12, 0];
        const opacitySteps = [0.15, 0.35, 0.55, 0.75, 0.9, 1];
        const ySteps = [24, 18, 12, 6, 2, 0];
        const stepDuration = duration / steps.length;

        // Set initial state
        el.style.filter = `blur(${intensity}px)`;
        el.style.opacity = "0.15";
        el.style.transform = `translateY(24px)`;
        el.style.willChange = "filter, opacity, transform";

        function runAnimation() {
          const tl = gsap.timeline({
            onComplete: () => {
              if (!el) return;
              el.style.filter = "";
              el.style.opacity = "";
              el.style.transform = "";
              el.style.willChange = "";
            },
          });

          steps.forEach((blur, i) => {
            tl.to(el, {
              duration: stepDuration,
              ease: "none",
              onStart: () => {
                if (!el) return;
                el.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
                el.style.opacity = String(opacitySteps[i]);
                el.style.transform = `translateY(${ySteps[i]}px)`;
              },
            });
          });
        }

        if (immediate) {
          // Small delay so the page paints first
          gsap.delayedCall(0.15, runAnimation);
        } else {
          gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
              onEnter: runAnimation,
            },
          });
        }
      });

      // Reduced motion — just show content
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const el = ref.current;
        if (el) {
          el.style.filter = "";
          el.style.opacity = "";
          el.style.transform = "";
        }
      });
    },
    { scope: ref }
  );

  return <div ref={ref}>{children}</div>;
}

"use client";

import { useRef, useEffect } from "react";

const PIXEL = 6;
const GRID = 7;

/**
 * Pixel-art icon library. Each entry is a 7x7 grid where 1 = filled pixel.
 * New icons should feel hand-placed but readable at 48px — avoid diagonal
 * single pixels where possible; prefer 2-pixel strokes for legibility.
 */
const pixelMaps: Record<string, number[][]> = {
  // ── ARLO persona icons ───────────────────────────────

  // SEO Specialist — magnifying glass (top-left circle + diagonal handle)
  Search: [
    [0, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 1],
  ],

  // Google Ads Specialist — bullseye target
  Target: [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
  ],

  // Meta / Social Ads — megaphone cone
  Megaphone: [
    [0, 0, 0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1],
  ],

  // Account Manager — person with broad connection arc (client relationships)
  Users: [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 0, 1, 1],
  ],

  // Agency Owner — cityscape (two buildings)
  Building: [
    [0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 1],
    [0, 1, 1, 1, 1, 0, 1],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],

  // Solo Business Owner — single storefront / house with peaked roof
  Home: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],

  // ── Legacy (kept for back-compat with any lingering refs) ──

  Building2: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 0, 0],
  ],
  Bot: [
    [0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 1, 0],
  ],
  Workflow: [
    [0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1],
  ],
  BarChart3: [
    [0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0],
  ],
  RefreshCcw: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
};

interface PixelIconProps {
  icon: string;
  color?: string;
  size?: number;
}

export function PixelIcon({ icon, color = "#0c0c0c", size = 40 }: PixelIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = pixelMaps[icon] || pixelMaps.Bot;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = GRID * PIXEL;
    canvas.height = GRID * PIXEL;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        if (map[row]?.[col]) {
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }
    }
  }, [icon, color, map]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID * PIXEL}
      height={GRID * PIXEL}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    />
  );
}

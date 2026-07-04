"use client";

/**
 * Minimal single-series sparkline — no axes, ticks, or legend (by design; a
 * sparkline is a glanceable trend, not a chart to read values off). One color,
 * a faint area fill, drawn as inline SVG so it costs nothing extra to load.
 */
export function Sparkline({
  values,
  color = "#193133",
  height = 30,
  className = "",
}: {
  values: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  // Need at least two points to draw a line.
  if (!values || values.length < 2) return null;

  const W = 100;
  const H = height;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = W / (values.length - 1);
  const pad = 2; // keep the stroke off the top/bottom edge

  const pts = values.map((v, i) => {
    const x = i * step;
    const y = pad + (H - pad * 2) * (1 - (v - min) / range);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const [lastX, lastY] = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      width="100%"
      height={H}
      className={className}
      aria-hidden="true"
    >
      <path d={area} fill={color} opacity={0.08} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* End-point dot for a clear "where it is now" read. */}
      <circle cx={lastX} cy={lastY} r={2} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

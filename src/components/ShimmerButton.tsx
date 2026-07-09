"use client";

import Link from "next/link";

/** The exact home/services primary CTA (spinning neon shimmer). Styles live in
 *  globals.css under .arlo-shimmer / .arlo-shimmer-label. Use everywhere a
 *  primary "Start For Free"-style action appears so every CTA is identical. */
export function ShimmerButton({
  href,
  children,
  onClick,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link href={href} onClick={onClick} className={`arlo-shimmer ${className}`}>
      <span className="arlo-shimmer-label">{children}</span>
    </Link>
  );
}

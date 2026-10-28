"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  /** ember star separator between items */
  separator?: string;
  reverse?: boolean;
  fast?: boolean;
};

/**
 * Infinite editorial marquee strip. Two copies of the content translate -50%
 * for a seamless loop. Used as a kinetic band under the hero.
 */
export function Marquee({
  items,
  className,
  separator = "✳",
  reverse = false,
  fast = false,
}: MarqueeProps) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap">{item}</span>
          <span className="mx-6 text-primary md:mx-10" aria-hidden>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn("mask-fade-x flex overflow-hidden", className)}
      aria-hidden
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center",
          fast ? "animate-marquee-fast" : "animate-marquee",
          reverse && "[animation-direction:reverse]"
        )}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

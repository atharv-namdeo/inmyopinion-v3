"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ShelfProps = {
  title: string;
  emoji?: string;
  showAllHref?: string;
  children: ReactNode;
  className?: string;
  /** lay children in a horizontal scroll row (default) or a wrapping grid */
  layout?: "row" | "grid";
};

/**
 * Spotify-style content shelf: a bold title with an optional "show all", and a
 * horizontally-scrolling row of cards (scrollbar hidden).
 */
export function Shelf({
  title,
  emoji,
  showAllHref,
  children,
  className,
  layout = "row",
}: ShelfProps) {
  return (
    <section className={cn("mt-8", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-4 px-1">
        <h2 className="h-display text-2xl font-black lowercase tracking-tight md:text-[1.6rem]">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h2>
        {showAllHref && (
          <Link
            href={showAllHref}
            data-cursor="hover"
            className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            show all
          </Link>
        )}
      </div>

      {layout === "row" ? (
        <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {children}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {children}
        </div>
      )}
    </section>
  );
}

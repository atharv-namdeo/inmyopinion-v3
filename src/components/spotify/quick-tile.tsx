"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickTileProps = {
  label: string;
  Icon: LucideIcon;
  href: string;
  tile?: number; // 1..6 gradient
  className?: string;
};

/**
 * "Recently played"-style quick tile — a rounded bar with a gradient cover
 * holding a Lucide icon, a label, and a play button that pops on hover.
 */
export function QuickTile({ label, Icon, href, tile = 1, className }: QuickTileProps) {
  return (
    <Link href={href} data-cursor="hover" className="group block">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative flex items-center gap-4 overflow-hidden rounded-lg bg-secondary/60 pr-4 transition-colors hover:bg-secondary",
          className
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center md:h-[72px] md:w-[72px]",
            `tile-${tile}`
          )}
        >
          <Icon className="text-white" size={28} strokeWidth={2.4} />
        </div>
        <span className="min-w-0 flex-1 truncate pr-12 font-heading text-sm font-bold lowercase md:text-base">
          {label}
        </span>
        <span className="absolute right-3 top-1/2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 ease-out-expo group-hover:opacity-100">
          <Play className="h-[18px] w-[18px] fill-current" />
        </span>
      </motion.div>
    </Link>
  );
}

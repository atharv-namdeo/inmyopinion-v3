"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type Floater = {
  Icon: LucideIcon;
  className: string; // positioning, e.g. "left-[8%] top-[20%]"
  color?: string; // tailwind text color class
  size?: number;
  rotate?: number;
  delay?: number;
};

/**
 * Scattered floating icons (open-source Lucide set). Clean line-icons in a
 * soft glass chip, gently bobbing. Decorative only.
 */
export function Floaters({ items }: { items: Floater[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((f, i) => (
        <motion.span
          key={i}
          className={`absolute ${f.className}`}
          initial={{ opacity: 0, scale: 0, rotate: (f.rotate ?? 0) - 25 }}
          animate={{ opacity: 1, scale: 1, rotate: f.rotate ?? 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 12, delay: f.delay ?? 0.2 + i * 0.08 }}
          style={{ rotate: `${f.rotate ?? 0}deg` }}
        >
          <motion.span
            className="flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 p-3 shadow-xl backdrop-blur-md md:p-4"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            <f.Icon
              className={f.color ?? "text-white"}
              size={f.size ?? 34}
              strokeWidth={2.4}
            />
          </motion.span>
        </motion.span>
      ))}
    </div>
  );
}

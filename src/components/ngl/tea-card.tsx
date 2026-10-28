"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TeaCardProps = {
  banner: string; // e.g. "the tea"
  body: string; // e.g. "you never text back"
  Icon: LucideIcon;
  tile?: number; // gradient for the banner
  rotate?: number;
  className?: string;
};

/**
 * Anonymous-message card: a colored gradient banner header (icon + label) and
 * a white body with the message. Rotated, sticker-like.
 */
export function TeaCard({ banner, body, Icon, tile = 1, rotate = 0, className }: TeaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotate - 8 }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ scale: 1.05, rotate: rotate + 2 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      style={{ rotate: `${rotate}deg` }}
      className={cn("w-[220px] overflow-hidden rounded-2xl bg-white shadow-2xl", className)}
    >
      <div className={cn("flex items-center justify-center gap-2 px-4 py-3", `tile-${tile}`)}>
        <Icon className="text-white" size={18} strokeWidth={2.6} />
        <span className="font-heading text-base font-black uppercase tracking-tight text-white">
          {banner}
        </span>
      </div>
      <div className="px-5 py-6 text-center">
        <p className="font-heading text-base font-bold text-neutral-900">{body}</p>
      </div>
    </motion.div>
  );
}

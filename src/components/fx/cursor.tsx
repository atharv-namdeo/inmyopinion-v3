"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Editorial custom cursor: a small dot + a lagging ember ring that grows and
 * flips to "the crowd decides" energy when hovering interactive elements.
 * Disabled on touch / coarse pointers.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none-fine");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const t = e.target as HTMLElement;
      setActive(
        !!t.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor='hover']")
      );
    };
    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("cursor-none-fine");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* dot — tracks the true pointer (no lag); inner div centers it on the point */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100]"
        style={{ x, y, opacity: hidden ? 0 : 1 }}
      >
        <div className="h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      </motion.div>
      {/* ring — lags slightly; inner div keeps it centered as it resizes */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100]"
        style={{ x: ringX, y: ringY, opacity: hidden ? 0 : 1 }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/70"
          animate={{
            width: active ? 48 : 28,
            height: active ? 48 : 28,
            borderWidth: active ? 1.5 : 1,
            backgroundColor: active
              ? "hsl(var(--primary) / 0.12)"
              : "hsl(var(--primary) / 0)",
          }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
        />
      </motion.div>
    </>
  );
}

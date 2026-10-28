"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  children: string;
  className?: string;
  /** stagger between units, seconds */
  stagger?: number;
  /** delay before start, seconds */
  delay?: number;
  /** split by word or character */
  by?: "word" | "char";
  /** run once or every time it enters view */
  once?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
};

/**
 * Kinetic split-text reveal. Each unit rises + fades from a clipped baseline —
 * the signature move of editorial award-sites. Uses whileInView + variants so
 * above-the-fold content animates reliably on mount.
 */
export function SplitText({
  children,
  className,
  stagger = 0.045,
  delay = 0,
  by = "word",
  once = true,
  as = "span",
}: SplitTextProps) {
  const units = by === "word" ? children.split(" ") : Array.from(children);

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const unitVariants: Variants = {
    hidden: { y: "110%", opacity: 0, rotate: 4 },
    show: {
      y: "0%",
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const Comp = motion[as] as typeof motion.span;

  return (
    <Comp
      className={cn("inline-block", className)}
      aria-label={children}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.3 }}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-top"
          aria-hidden
          style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
        >
          <motion.span className="inline-block" variants={unitVariants}>
            {unit}
            {by === "word" && i < units.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

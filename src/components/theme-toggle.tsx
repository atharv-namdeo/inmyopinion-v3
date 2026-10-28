"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Friendly pill theme switch. Reads the class the no-flash boot script set,
 * then persists changes to localStorage. Dark = editorial mood, light = warm/NGL.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("verdikt-theme", next);
    } catch {
      /* ignore */
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      data-cursor="hover"
      className="group relative inline-flex h-11 w-[72px] items-center rounded-full border border-border bg-secondary/60 p-1 backdrop-blur transition-colors hover:border-primary/50"
    >
      {/* track icons */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5 text-muted-foreground">
        <Sun className="h-4 w-4" />
        <Moon className="h-4 w-4" />
      </span>
      {/* knob */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.7)]"
        style={{ marginLeft: mounted && isDark ? "auto" : 0 }}
      >
        {mounted && isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </motion.span>
    </button>
  );
}

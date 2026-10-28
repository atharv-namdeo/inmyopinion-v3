"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

/**
 * Center nav links for the top bar. "make a spill" is auth-aware.
 */
export function NavLinks() {
  const { user } = useAuth();
  const links = [
    { label: "make a spill", href: user ? "/create" : "/login" },
    { label: "group spill", href: user ? "/group/create" : "/login" },
    { label: "how it works", href: "/#how" },
    { label: "my spills", href: user ? "/#your-spills" : "/login" },
  ];

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map((l) => (
        <Link
          key={l.label}
          href={l.href}
          data-cursor="hover"
          className="rounded-full px-4 py-2 text-sm font-bold lowercase text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

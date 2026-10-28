"use client";

/**
 * Full-viewport film-grain + vignette. Pure texture (no illustration),
 * gives the whole app a tactile, printed-matter feel.
 */
export function Grain() {
  return <div className="grain vignette pointer-events-none fixed inset-0 z-[60]" aria-hidden />;
}

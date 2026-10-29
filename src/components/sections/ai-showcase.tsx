"use client";

import { motion } from "framer-motion";
import { Flame, TrendingUp, Heart } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/**
 * Landing showcase for the AI tea-reader. The card is a clearly-labelled
 * PREVIEW: the real one runs on your own results.
 */
export function AiShowcase() {
 return (
 <section className="mx-auto w-full max-w-[1400px] px-5 py-24 md:px-8 md:py-32">
 <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
 <Reveal>
 <div>
 <span className="sticker inline-flex bg-candy-purple text-white">ai magic </span>
 <h2 className="h-display mt-4 text-fluid-xl font-black lowercase leading-[0.95]">
 not just votes.<br />
 <span className="text-primary">the actual tea. </span>
 </h2>
 <p className="mt-5 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
 charts show you <em>what</em> people picked. spill&apos;s AI tells you
 what it <em>means</em>: it reads every anonymous answer and hands you
 a lil personality read you can screenshot and post.
 </p>
 <ul className="mt-6 space-y-2.5 text-sm font-medium">
 {[
 { Icon: Flame, t: "clocks the landslides, splits & plot twists" },
 { Icon: TrendingUp, t: "gives you a crowd-approval score" },
 { Icon: Heart, t: "cheeky but kind, never mean" },
 ].map((f) => (
 <li key={f.t} className="flex items-center gap-3">
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
 <f.Icon className="h-4 w-4" />
 </span>
 {f.t}
 </li>
 ))}
 </ul>
 </div>
 </Reveal>

 <Reveal delay={0.15}>
 <motion.div
 whileHover={{ y: -6, rotate: -1 }}
 transition={{ type: "spring", stiffness: 300, damping: 24 }}
 className="card-editorial relative overflow-hidden rounded-[1.75rem] p-8 md:p-10"
 >
 <div
 aria-hidden
 className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-candy-pink/30 blur-3xl"
 />
 <div className="relative flex items-center justify-between">
 <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-muted-foreground">
 preview
 </span>
 <span className="sticker bg-candy-pink text-white">beloved chaos gremlin</span>
 </div>
 <div className="relative mt-5 flex items-center gap-2">
 <span className="relative h-3 w-32 overflow-hidden rounded-full bg-secondary">
 <motion.span
 className="absolute inset-y-0 left-0 rounded-full bg-primary"
 initial={{ width: 0 }}
 whileInView={{ width: "82%" }}
 viewport={{ once: true }}
 transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
 />
 </span>
 <span className="font-mono text-xs font-bold text-muted-foreground">
 82<span className="opacity-60">/100 approval</span>
 </span>
 </div>
 <h3 className="h-display mt-5 text-3xl font-black lowercase leading-tight">
 chaotic, adored, mildly feral.
 </h3>
 <p className="mt-4 text-lg font-medium leading-relaxed text-foreground/90">
 the people have spoken: you&apos;d 100% help them hide a body, but
 they&apos;re split down the middle on whether you ever text back. a
 beloved menace with commitment issues to your notifications.
 </p>
 <p className="relative mt-6 text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground">
 example read · your real one runs on your own results
 </p>
 </motion.div>
 </Reveal>
 </div>
 </section>
 );
}

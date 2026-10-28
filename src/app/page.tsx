"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowDown, Sparkles, Hand, Coffee, Eye, Flame, MessageCircle,
  Smartphone, HeartHandshake, Flag, Shirt, Heart, PencilLine, Link2,
  Quote, Crown, ThumbsUp, Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Marquee } from "@/components/fx/marquee";
import { Floaters } from "@/components/ngl/floaters";
import { TeaCard } from "@/components/ngl/tea-card";
import { YourSpillsShelf } from "@/components/spotify/your-spills-shelf";
import { Shelf } from "@/components/spotify/shelf";
import { QuickTile } from "@/components/spotify/quick-tile";
import { AiShowcase } from "@/components/sections/ai-showcase";

const STARTERS = [
  { label: "how i text back", Icon: Smartphone, tile: 1 },
  { label: "my whole vibe", Icon: Sparkles, tile: 2 },
  { label: "am i a good friend", Icon: HeartHandshake, tile: 3 },
  { label: "my red flags", Icon: Flag, tile: 5 },
  { label: "rate my drip", Icon: Shirt, tile: 6 },
  { label: "would you date me", Icon: Heart, tile: 4 },
];

const HOW = [
  { n: "01", Icon: PencilLine, tile: 1, t: "make it", d: "spin up a poll about yourself: tap-to-pick or slide-the-scale." },
  { n: "02", Icon: Link2, tile: 3, t: "share it", d: "one link → your bio, story, or the gc. anyone answers anon." },
  { n: "03", Icon: Coffee, tile: 5, t: "read the tea", d: "watch answers roll in, then let AI hand you the actual vibe." },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const go = () => router.push(user ? "/create" : "/login");
  const goGroup = () => router.push(user ? "/group/create" : "/login");

  return (
    <main className="w-full bg-black text-white">
      {/* ============ HERO ============ */}
      <section className="ngl-grad curve-bottom relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 pb-20 pt-24 text-center">
        <Floaters
          items={[
            { Icon: Hand, className: "left-[10%] top-[24%]", rotate: -12 },
            { Icon: Coffee, className: "right-[12%] top-[28%]", rotate: 10 },
            { Icon: Eye, className: "left-[16%] bottom-[20%]", rotate: -6 },
            { Icon: MessageCircle, className: "right-[16%] bottom-[22%]", rotate: 8 },
            { Icon: Sparkles, className: "left-[6%] top-[52%]", size: 26, rotate: 14 },
            { Icon: Flame, className: "right-[7%] top-[54%]", size: 26, rotate: -10 },
          ]}
        />
        <div className="relative z-10">
          <h1 className="display text-[clamp(3.5rem,13vw,11rem)] font-black lowercase leading-[0.85] text-white">
            spill<br />the tea
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg font-bold text-white/90 md:text-xl">
            make a lil poll about yourself & find out what people <em>actually</em> think. 100% anonymous.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={go}
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 font-heading text-xl font-black lowercase text-primary shadow-2xl transition-shadow hover:shadow-white/30"
            >
              <Sparkles className="h-5 w-5" /> make my spill
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goGroup}
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 px-10 py-5 font-heading text-xl font-black lowercase text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <Users className="h-5 w-5" /> group spill
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm font-bold lowercase text-white/80"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" /> scroll for more
        </motion.div>
      </section>

      {/* ============ YOUR SPILLS ============ */}
      <section id="your-spills" className="w-full scroll-mt-20 px-5 py-16 md:px-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <YourSpillsShelf />
        </div>
      </section>

      {/* ============ READ THE TEA (cards) ============ */}
      <section className="ngl-grad-alt curve-top curve-bottom relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 py-24 text-center">
        <h2 className="display relative z-10 text-[clamp(3rem,11vw,9rem)] font-black lowercase leading-[0.85] text-white">
          read<br />the tea
        </h2>
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          <div className="pointer-events-auto absolute left-[6%] top-[16%]"><TeaCard banner="the tea" Icon={Coffee} body="you never text back" tile={2} rotate={-8} /></div>
          <div className="pointer-events-auto absolute right-[7%] top-[14%]"><TeaCard banner="3 words" Icon={Quote} body="funny, chaotic, kind" tile={6} rotate={7} /></div>
          <div className="pointer-events-auto absolute left-[8%] bottom-[12%]"><TeaCard banner="red flag" Icon={Flag} body="always fashionably late" tile={5} rotate={6} /></div>
          <div className="pointer-events-auto absolute right-[6%] bottom-[14%]"><TeaCard banner="green flag" Icon={ThumbsUp} body="would help me move a body" tile={4} rotate={-6} /></div>
        </div>
      </section>

      {/* marquee divider */}
      <div className="w-full overflow-hidden bg-primary py-4 text-primary-foreground">
        <Marquee
          className="font-heading text-2xl font-black lowercase md:text-3xl"
          separator="•"
          items={["spill the tea", "no cap", "100% anonymous", "what do they really think", "rate my vibe", "no filter all love"]}
        />
      </div>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="w-full scroll-mt-24 px-5 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1100px] text-center">
          <h2 className="display text-[clamp(2.5rem,8vw,6rem)] font-black lowercase leading-[0.9]">
            3 steps. <span className="text-primary">0 stress.</span>
          </h2>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {HOW.map((s) => (
              <div key={s.t} className="rounded-3xl bg-white/[0.06] p-8 text-left ring-1 ring-white/10">
                <span className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg tile-${s.tile}`}>
                  <s.Icon className="text-white" size={28} strokeWidth={2.4} />
                </span>
                <h3 className="h-display mt-5 text-2xl font-black lowercase">{s.t}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI feature */}
      <div id="ai" className="mx-auto w-full max-w-[1100px] scroll-mt-24 px-5 md:px-8">
        <AiShowcase />
      </div>

      {/* ============ JOIN / CTA ============ */}
      <section className="ngl-grad curve-top relative mt-16 flex min-h-[85svh] w-full flex-col items-center justify-center overflow-hidden px-5 py-24 text-center">
        <Floaters
          items={[
            { Icon: Coffee, className: "left-[12%] top-[22%]", rotate: -14 },
            { Icon: Crown, className: "right-[14%] top-[18%]", rotate: 12 },
            { Icon: Heart, className: "left-[16%] bottom-[20%]", rotate: 8 },
            { Icon: Sparkles, className: "right-[16%] bottom-[24%]", size: 26, rotate: -8 },
          ]}
        />
        <div className="relative z-10">
          <h2 className="display text-[clamp(3rem,12vw,10rem)] font-black lowercase leading-[0.85] text-white">
            join<br />the spill
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg font-bold text-white/90">
            takes 2 mins. warning: you might actually learn something about yourself.
          </p>
          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={go}
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 font-heading text-xl font-black lowercase text-primary shadow-2xl transition-shadow hover:shadow-white/30"
            >
              <Sparkles className="h-5 w-5" /> make my spill
            </motion.button>
          </div>
        </div>
      </section>

      {/* ============ STARTERS ============ */}
      <section className="w-full px-5 py-16 md:px-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <Shelf title="spill about…">
            {STARTERS.map((s) => (
              <div key={s.label} className="w-[280px] shrink-0 snap-start">
                <QuickTile label={s.label} Icon={s.Icon} href={user ? "/create" : "/login"} tile={s.tile} />
              </div>
            ))}
          </Shelf>
        </div>
      </section>

      {/* footer */}
      <footer className="w-full px-5 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center justify-between gap-4 md:flex-row">
          <span className="display text-3xl font-black lowercase tracking-tight">
            sp<span className="text-primary">i</span>ll
          </span>
          <p className="text-xs font-bold lowercase tracking-[0.2em] text-white/50">
            made with unserious energy · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}

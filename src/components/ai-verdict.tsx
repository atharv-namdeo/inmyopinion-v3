"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { type Quiz, type QuizResponse } from "@/lib/types";
import {
 requestVerdictReading,
 type VerdictResult,
} from "@/app/actions";
import type { VerdictReadingOutput } from "@/ai/flows/verdict-reading";

type Props = {
 quiz: Quiz;
 responses: QuizResponse[];
};

function buildSummary(quiz: Quiz, responses: QuizResponse[]) {
 return quiz.questions.map((q) => {
 const answers = responses
.map((r) => r.answers[q.id])
.filter((a) => a !== undefined);
 const base = {
 text: q.text,
 type: q.type,
 totalResponses: answers.length,
 };
 if (q.type ==="multiple-choice" && q.options) {
 const breakdown: Record<string, number> = {};
 q.options.forEach((opt) => (breakdown[opt] = 0));
 answers.forEach((a) => {
 if (breakdown[a as string] !== undefined) breakdown[a as string]++;
 });
 return {...base, breakdown };
 }
 const nums = answers.map((a) => Number(a)).filter((n) =>!Number.isNaN(n));
 const average = nums.length
? Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 10) / 10
 : 0;
 return {...base, average };
 });
}

export function AiVerdict({ quiz, responses }: Props) {
 const [state, setState] = useState<
 | { phase: "idle" }
 | { phase: "loading" }
 | { phase: "done"; reading: VerdictReadingOutput }
 | { phase: "no-key" }
 | { phase: "error"; message: string }
 >({ phase: "idle" });

 const run = async () => {
 setState({ phase: "loading" });
 try {
 const result: VerdictResult = await requestVerdictReading({
 quizTitle: quiz.title,
 totalVerdicts: responses.length,
 questions: buildSummary(quiz, responses),
 });
 if (result.status ==="ok") setState({ phase: "done", reading: result.reading });
 else if (result.status ==="no-key") setState({ phase: "no-key" });
 else setState({ phase: "error", message: result.message });
 } catch (e: any) {
 setState({ phase: "error", message: e?.message??"Something went wrong." });
 }
 };

 return (
 <div className="card-editorial relative overflow-hidden rounded-2xl p-8 md:p-10">
 {/* ember wash */}
 <div
 aria-hidden
 className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
 />
 <div className="relative flex items-center gap-3">
 <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-candy-purple text-white shadow-lg">
 <Sparkles className="h-6 w-6" />
 </span>
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
 ai magic
 </p>
 <h2 className="h-display text-2xl font-black lowercase leading-none">
 the tea, decoded
 </h2>
 </div>
 </div>

 <AnimatePresence mode="wait">
 {state.phase ==="idle" && (
 <motion.div
 key="idle"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="relative mt-6"
 >
 <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
 let the AI read the room. it goes through every anonymous answer and
 hands you a punchy, screenshot-able read on what people actually
 think.
 </p>
 <div className="mt-6">
 <Magnetic strength={0.35}>
 <Button
 onClick={run}
 size="lg"
 className="uppercase tracking-wide"
 disabled={responses.length === 0}
 >
 <Sparkles className="h-5 w-5" />
 read the tea
 </Button>
 </Magnetic>
 {responses.length === 0 && (
 <p className="mt-3 text-xs text-muted-foreground">
 you need at least 1 answer first, bestie.
 </p>
 )}
 </div>
 </motion.div>
 )}

 {state.phase ==="loading" && (
 <motion.div
 key="loading"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="relative mt-8 space-y-3"
 >
 <div className="flex items-center gap-3 text-sm text-muted-foreground">
 <Loader2 className="h-4 w-4 animate-spin text-primary" />
 reading the room…
 </div>
 {[0, 1, 2].map((i) => (
 <div
 key={i}
 className="h-3 overflow-hidden rounded-full bg-secondary"
 style={{ width: `${90 - i * 15}%` }}
 >
 <div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
 </div>
 ))}
 </motion.div>
 )}

 {state.phase ==="done" && (
 <motion.div
 key="done"
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="relative mt-6"
 >
 <div className="flex flex-wrap items-center gap-3">
 <span className="sticker bg-candy-pink text-white">{state.reading.vibe}</span>
 <ScoreMeter value={state.reading.score} />
 </div>
 <h3 className="h-display mt-5 text-3xl font-black lowercase leading-tight md:text-4xl">
 {state.reading.headline}
 </h3>
 <p className="mt-4 text-lg font-medium leading-relaxed text-foreground/90">
 {state.reading.reading}
 </p>
 <button
 onClick={run}
 data-cursor="hover"
 className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
 >
 <RefreshCw className="h-3.5 w-3.5" /> re-read the room
 </button>
 </motion.div>
 )}

 {state.phase ==="no-key" && (
 <motion.div
 key="nokey"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="relative mt-6 rounded-xl border border-dashed border-border bg-secondary/30 p-5"
 >
 <div className="flex items-center gap-2 text-sm font-semibold">
 <KeyRound className="h-4 w-4 text-primary" />
 one step to switch the AI on
 </div>
 <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
 the tea-reader needs a Google AI key. create a{""}
 <code className="rounded bg-background px-1.5 py-0.5 text-xs">
.env.local
 </code>{""}
 in the project root with{""}
 <code className="rounded bg-background px-1.5 py-0.5 text-xs">
 GEMINI_API_KEY=your_key
 </code>{""}
 (free at aistudio.google.com), then restart the dev
 server. everything else works without it.
 </p>
 </motion.div>
 )}

 {state.phase ==="error" && (
 <motion.div
 key="error"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="relative mt-6"
 >
 <p className="text-sm text-destructive">
 the ai spilled its own tea : {state.message}
 </p>
 <button
 onClick={run}
 data-cursor="hover"
 className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary"
 >
 <RefreshCw className="h-3.5 w-3.5" /> try again
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

function ScoreMeter({ value }: { value: number }) {
 const v = Math.max(0, Math.min(100, value));
 return (
 <span className="inline-flex items-center gap-2">
 <span className="relative h-2 w-28 overflow-hidden rounded-full bg-secondary">
 <motion.span
 className="absolute inset-y-0 left-0 rounded-full bg-primary"
 initial={{ width: 0 }}
 animate={{ width: `${v}%` }}
 transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
 />
 </span>
 <span className="font-mono text-xs text-muted-foreground">
 {v}<span className="opacity-60">/100 approval</span>
 </span>
 </span>
 );
}

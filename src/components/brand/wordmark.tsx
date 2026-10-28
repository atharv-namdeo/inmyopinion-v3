"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type WordmarkProps = {
 className?: string;
 tagline?: boolean;
 href?: string | null;
};

/**
 * spill wordmark — lowercase, chunky, playful. The dot on the"i" is a candy
 * dot and there's a lil teacup, because we're spilling tea.
 */
export function Wordmark({ className, tagline = false, href ="/" }: WordmarkProps) {
 const mark = (
 <span className="inline-flex flex-col leading-none">
 <span className="wordmark inline-flex items-center text-[1.55rem] lowercase leading-none tracking-[-0.04em]">
 <span>sp</span>
 {/* dotless i with a candy dot */}
 <span className="relative inline-block">
 <span>ı</span>
 <span className="absolute -top-[0.16em] left-1/2 h-[0.16em] w-[0.16em] -translate-x-1/2 rounded-full bg-candy-pink" />
 </span>
 <span>ll</span>
 </span>
 {tagline && (
 <span className="grotesk mt-1 text-[0.6rem] font-semibold lowercase tracking-[0.18em] text-muted-foreground">
 what do they really think?
 </span>
 )}
 </span>
 );

 if (href === null) {
 return <span className={cn("select-none", className)}>{mark}</span>;
 }

 return (
 <Link
 href={href}
 aria-label="spill home"
 className={cn(
"group select-none outline-none transition-transform duration-300 ease-out-expo hover:-translate-y-[1px] hover:-rotate-1",
 className
 )}
 >
 {mark}
 </Link>
 );
}

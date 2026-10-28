"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Share2, Pencil, Trash2, Play, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SpillCardProps = {
  id: string;
  title: string;
  meta: string;
  tile?: number; // 1..6
  Icon: LucideIcon;
  onCopy?: () => void;
  onDelete?: () => void;
};

/**
 * Playlist-style card for a spill: gradient cover with a Lucide icon, title,
 * meta, a coral "open" button on hover, and small inline actions.
 */
export function SpillCard({
  id,
  title,
  meta,
  tile = 1,
  Icon,
  onCopy,
  onDelete,
}: SpillCardProps) {
  const router = useRouter();
  const resultsHref = `/results/${id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-spotify group relative w-[180px] shrink-0 snap-start p-3"
    >
      <Link href={resultsHref} data-cursor="hover" className="block">
        <div
          className={cn(
            "relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg shadow-lg",
            `tile-${tile}`
          )}
        >
          <Icon className="text-white" size={44} strokeWidth={2.2} />
          <span className="absolute bottom-2 right-2 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
            <Play className="h-[18px] w-[18px] fill-current" />
          </span>
        </div>
      </Link>

      <Link href={resultsHref} data-cursor="hover">
        <h3 className="truncate font-heading text-sm font-bold lowercase" title={title}>
          {title}
        </h3>
      </Link>
      <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{meta}</p>

      <div className="mt-3 flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        <button
          onClick={onCopy}
          data-cursor="hover"
          aria-label="copy link"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => router.push(`/create?quizId=${id}`)}
          data-cursor="hover"
          aria-label="edit"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          data-cursor="hover"
          aria-label="delete"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

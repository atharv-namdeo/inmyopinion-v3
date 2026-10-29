"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { type Quiz } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Shelf } from "./shelf";
import { SpillCard } from "./spill-card";
import { Coffee, Eye, Flame, MessageCircle, Sparkles, Heart, HelpCircle, Star } from "lucide-react";

const ICONS = [Coffee, Eye, MessageCircle, Sparkles, Flame, Heart, HelpCircle, Star];

export function YourSpillsShelf() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = useCallback(
    async (uid: string) => {
      setLoading(true);
      try {
        // no orderBy → avoids needing a composite Firestore index; sort in JS
        const q = query(collection(db, "quizzes"), where("userId", "==", uid));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
        list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setQuizzes(list);
      } catch (e) {
        console.error("Error fetching spills: ", e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (user) fetchQuizzes(user.uid);
    else if (!authLoading) {
      setQuizzes([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchQuizzes]);

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/quiz?id=${id}`;
    navigator.clipboard.writeText(url).then(
      () => toast({ title: "copied!", description: "link copied, go share it" }),
      () => toast({ variant: "destructive", title: "couldn't copy", description: "copy it manually?" })
    );
  };

  const remove = async (id: string) => {
    if (!window.confirm("delete this spill? this can't be undone.")) return;
    try {
      await deleteDoc(doc(db, "quizzes", id));
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast({ title: "deleted", description: "your spill was deleted." });
    } catch (e) {
      toast({ variant: "destructive", title: "delete failed", description: "try again?" });
    }
  };

  if (authLoading || loading) {
    return (
      <Shelf title="your spills">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[180px] shrink-0 animate-pulse p-3">
            <div className="mb-3 aspect-square rounded-lg bg-secondary" />
            <div className="h-3 w-3/4 rounded bg-secondary" />
            <div className="mt-2 h-2 w-1/2 rounded bg-secondary" />
          </div>
        ))}
      </Shelf>
    );
  }

  if (!user) {
    return (
      <Shelf title="your spills">
        <div className="flex w-full flex-col items-start gap-3 rounded-xl bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">log in to see the spills you&apos;ve made.</p>
          <Button asChild size="sm"><Link href="/login">log in</Link></Button>
        </div>
      </Shelf>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Shelf title="your spills">
        <div className="flex w-full flex-col items-start gap-3 rounded-xl bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">no spills yet, make your first one.</p>
          <Button asChild size="sm"><Link href="/create">make a spill</Link></Button>
        </div>
      </Shelf>
    );
  }

  return (
    <Shelf title="your spills">
      {quizzes.map((quiz, i) => (
        <SpillCard
          key={quiz.id}
          id={quiz.id}
          title={quiz.title}
          meta={`${quiz.questions.length} q · ${formatDistanceToNow(quiz.createdAt.toDate(), { addSuffix: true })}`}
          tile={(i % 6) + 1}
          Icon={ICONS[i % ICONS.length]}
          onCopy={() => copyLink(quiz.id)}
          onDelete={() => remove(quiz.id)}
        />
      ))}
    </Shelf>
  );
}

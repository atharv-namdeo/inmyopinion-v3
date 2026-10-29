"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { type Quiz, type Group } from '@/lib/types';
import {
  Sparkles,
  Users,
  PlusCircle,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  ArrowRight,
  LogIn,
  Home,
  MessageCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ProfileSpill = {
  id: string;
  kind: 'solo' | 'group';
  title: string;
  count: number;
  members?: string[];
  createdAtMillis: number;
};

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [spills, setSpills] = useState<ProfileSpill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'solo' | 'group'>('all');

  const fetchSpills = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const qQuiz = query(collection(db, 'quizzes'), where('userId', '==', uid));
      const qGroup = query(collection(db, 'groups'), where('userId', '==', uid));

      const [snapQuiz, snapGroup] = await Promise.all([
        getDocs(qQuiz).catch(() => null),
        getDocs(qGroup).catch(() => null),
      ]);

      const soloList: ProfileSpill[] = snapQuiz
        ? snapQuiz.docs.map((d) => {
            const data = d.data() as Quiz;
            return {
              id: d.id,
              kind: 'solo' as const,
              title: data.title || 'my spill',
              count: data.questions?.length ?? 0,
              createdAtMillis: data.createdAt?.toMillis?.() ?? 0,
            };
          })
        : [];

      const groupList: ProfileSpill[] = snapGroup
        ? snapGroup.docs.map((d) => {
            const data = d.data() as Group;
            return {
              id: d.id,
              kind: 'group' as const,
              title: data.name || 'group spill',
              count: data.questions?.length ?? 0,
              members: data.members || [],
              createdAtMillis: data.createdAt?.toMillis?.() ?? 0,
            };
          })
        : [];

      const combined = [...soloList, ...groupList].sort(
        (a, b) => b.createdAtMillis - a.createdAtMillis
      );
      setSpills(combined);
    } catch (e) {
      console.error('Error fetching profile spills: ', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSpills(user.uid);
    } else if (!authLoading) {
      setSpills([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchSpills]);

  const copyLink = (id: string, kind: 'solo' | 'group') => {
    const url = `${window.location.origin}/${kind === 'solo' ? 'quiz?id=' : 'group?id='}${id}`;
    navigator.clipboard.writeText(url).then(
      () => toast({ title: 'copied!', description: 'link copied, go share it' }),
      () => toast({ variant: 'destructive', title: "couldn't copy", description: 'copy it manually?' })
    );
  };

  const deleteSpill = async (id: string, kind: 'solo' | 'group', title: string) => {
    if (!window.confirm(`delete "${title}"? this cannot be undone.`)) return;
    try {
      const col = kind === 'solo' ? 'quizzes' : 'groups';
      await deleteDoc(doc(db, col, id));
      setSpills((prev) => prev.filter((s) => !(s.id === id && s.kind === kind)));
      toast({ title: 'deleted', description: `your ${kind} spill was deleted.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'delete failed', description: 'try again?' });
    }
  };

  if (authLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-28">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="rounded-3xl border border-white/15 bg-secondary/40 p-8 shadow-xl backdrop-blur-xl">
          <span className="sticker inline-flex bg-candy-lime text-ink">profile</span>
          <h1 className="display mt-4 text-3xl font-black lowercase">log in to view profile</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            log in to see all the spills you have created, view live votes, and get links.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild size="lg" className="w-full">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> log in
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/register">create an account</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const soloCount = spills.filter((s) => s.kind === 'solo').length;
  const groupCount = spills.filter((s) => s.kind === 'group').length;

  const filteredSpills = spills.filter((s) => {
    if (activeTab === 'solo') return s.kind === 'solo';
    if (activeTab === 'group') return s.kind === 'group';
    return true;
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-28">
      {/* Top action row */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> back home
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/create">
              <PlusCircle className="mr-2 h-4 w-4 text-candy-lime" /> new solo spill
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/group/create">
              <Users className="mr-2 h-4 w-4 text-white" /> new group spill
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Hero Card */}
      <Card className="overflow-hidden rounded-3xl border-white/15 bg-gradient-to-br from-secondary/60 via-secondary/30 to-background shadow-xl backdrop-blur-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-primary/40 shadow-lg">
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${userProfile?.username || user.uid}`}
                  alt={userProfile?.username || ''}
                />
                <AvatarFallback className="text-xl font-bold">
                  {(userProfile?.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="sticker inline-flex bg-candy-lime text-ink">creator profile</span>
                <h1 className="font-heading mt-2 text-2xl sm:text-3xl font-extrabold lowercase tracking-tight">
                  {userProfile?.username || 'bestie'}
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Quick stats chips */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center backdrop-blur">
                <span className="block text-xl sm:text-2xl font-black text-foreground">{spills.length}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">total spills</span>
              </div>
              <div className="rounded-2xl border border-candy-lime/20 bg-candy-lime/5 p-3 text-center backdrop-blur">
                <span className="block text-xl sm:text-2xl font-black text-candy-lime">{soloCount}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">solo</span>
              </div>
              <div className="rounded-2xl border border-candy-blue/20 bg-candy-blue/5 p-3 text-center backdrop-blur">
                <span className="block text-xl sm:text-2xl font-black text-candy-blue">{groupCount}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">groups</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spills section header & tabs */}
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="font-heading text-2xl font-black lowercase tracking-tight">spills you made</h2>
          <p className="text-xs text-muted-foreground">all polls and group spills associated with your account</p>
        </div>

        <div className="flex gap-1.5 self-start sm:self-auto rounded-full bg-secondary/60 p-1 border border-border/40">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-foreground text-background shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            all ({spills.length})
          </button>
          <button
            onClick={() => setActiveTab('solo')}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              activeTab === 'solo'
                ? 'bg-candy-lime text-ink shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            solo ({soloCount})
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              activeTab === 'group'
                ? 'bg-candy-blue text-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            groups ({groupCount})
          </button>
        </div>
      </div>

      {/* Grid of Spills */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filteredSpills.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold lowercase">
              {spills.length === 0 ? 'no spills made yet' : 'no spills in this category'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              make a poll about yourself or create a group spill for your friend circle.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="sm">
                <Link href="/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> create solo spill
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/group/create">
                  <Users className="mr-2 h-4 w-4" /> create group spill
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpills.map((s) => {
              const resultsUrl = s.kind === 'solo' ? `/results/${s.id}` : `/group/results?id=${s.id}`;
              const voteUrl = s.kind === 'solo' ? `/quiz?id=${s.id}` : `/group?id=${s.id}`;

              return (
                <Card
                  key={s.id + s.kind}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border-white/10 bg-secondary/30 transition-all hover:border-primary/40 hover:bg-secondary/50"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight ${
                          s.kind === 'solo'
                            ? 'bg-candy-lime/20 text-candy-lime'
                            : 'bg-candy-blue/20 text-candy-blue'
                        }`}
                      >
                        {s.kind} spill
                      </span>
                      {s.createdAtMillis > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(s.createdAtMillis), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-heading mt-2 line-clamp-1 text-lg font-black lowercase text-foreground">
                      {s.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {s.kind === 'solo'
                        ? `${s.count} question${s.count === 1 ? '' : 's'}`
                        : `${s.members?.length || 0} friends · ${s.count} question${s.count === 1 ? '' : 's'}`}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="flex items-center justify-between gap-2 p-5 pt-3 border-t border-border/40 bg-black/10">
                    <Button asChild size="sm" className="flex-1 rounded-xl font-bold">
                      <Link href={resultsUrl}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> see tea
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                      title="copy spill link"
                      onClick={() => copyLink(s.id, s.kind)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="delete spill"
                      onClick={() => deleteSpill(s.id, s.kind, s.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  LogIn,
  PlusCircle,
  Users,
  Copy,
  Eye,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Quiz, type Group } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type UnifiedSpill =
  | { kind: 'solo'; id: string; title: string; count: number; createdAtMillis: number }
  | { kind: 'group'; id: string; title: string; count: number; memberCount: number; createdAtMillis: number };

export function ProfileButton() {
  const { user, userProfile, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [spills, setSpills] = useState<UnifiedSpill[]>([]);
  const [loadingSpills, setLoadingSpills] = useState(false);
  const [filter, setFilter] = useState<'all' | 'solo' | 'group'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const fetchUserSpills = useCallback(async (uid: string) => {
    setLoadingSpills(true);
    try {
      // 1. Fetch solo quizzes
      const qQuiz = query(collection(db, 'quizzes'), where('userId', '==', uid));
      const qGroup = query(collection(db, 'groups'), where('userId', '==', uid));

      const [snapQuiz, snapGroup] = await Promise.all([
        getDocs(qQuiz).catch(() => null),
        getDocs(qGroup).catch(() => null),
      ]);

      const soloList: UnifiedSpill[] = snapQuiz
        ? snapQuiz.docs.map((d) => {
            const data = d.data() as Quiz;
            return {
              kind: 'solo' as const,
              id: d.id,
              title: data.title || 'my spill',
              count: data.questions?.length ?? 0,
              createdAtMillis: data.createdAt?.toMillis?.() ?? 0,
            };
          })
        : [];

      const groupList: UnifiedSpill[] = snapGroup
        ? snapGroup.docs.map((d) => {
            const data = d.data() as Group;
            return {
              kind: 'group' as const,
              id: d.id,
              title: data.name || 'group spill',
              count: data.questions?.length ?? 0,
              memberCount: data.members?.length ?? 0,
              createdAtMillis: data.createdAt?.toMillis?.() ?? 0,
            };
          })
        : [];

      const combined = [...soloList, ...groupList].sort(
        (a, b) => b.createdAtMillis - a.createdAtMillis
      );

      setSpills(combined);
    } catch (err) {
      console.error('Error fetching user spills in profile:', err);
    } finally {
      setLoadingSpills(false);
    }
  }, []);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserSpills(user.uid);
    }
  }, [user, isOpen, fetchUserSpills]);

  if (authLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          log in
        </Link>
      </Button>
    );
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const copyLink = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(
      () => toast({ title: 'copied!', description: 'link copied, go share it' }),
      () => toast({ variant: 'destructive', title: "couldn't copy", description: 'copy it manually?' })
    );
  };

  const filteredSpills = spills.filter((s) => {
    if (filter === 'solo') return s.kind === 'solo';
    if (filter === 'group') return s.kind === 'group';
    return true;
  });

  const soloCount = spills.filter((s) => s.kind === 'solo').length;
  const groupCount = spills.filter((s) => s.kind === 'group').length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-white/20 p-0 hover:scale-105 transition-transform"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${userProfile?.username || user.uid}`}
              alt={userProfile?.username || ''}
            />
            <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[340px] sm:w-[380px] p-3 rounded-2xl border-white/15 bg-background/95 shadow-2xl backdrop-blur-2xl"
        align="end"
        forceMount
      >
        {/* Profile Card Header */}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-primary/30">
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${userProfile?.username || user.uid}`}
                  alt={userProfile?.username || ''}
                />
                <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-heading text-base font-extrabold lowercase text-foreground">
                  {userProfile?.username || 'bestie'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {spills.length} {spills.length === 1 ? 'spill' : 'spills'} made
                </span>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              profile <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </DropdownMenuLabel>

        {/* Section title & filter chips */}
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            spills made
          </span>
          <div className="flex gap-1 text-[11px] font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                filter === 'all'
                  ? 'bg-foreground text-background font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              all ({spills.length})
            </button>
            <button
              onClick={() => setFilter('solo')}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                filter === 'solo'
                  ? 'bg-candy-lime text-ink font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              solo ({soloCount})
            </button>
            <button
              onClick={() => setFilter('group')}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                filter === 'group'
                  ? 'bg-candy-blue text-white font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              groups ({groupCount})
            </button>
          </div>
        </div>

        {/* Spills list */}
        <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
          {loadingSpills ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : filteredSpills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                {spills.length === 0
                  ? 'no spills made yet. create your first one below.'
                  : 'no spills matching this filter.'}
              </p>
            </div>
          ) : (
            filteredSpills.map((s) => {
              const resultsUrl = s.kind === 'solo' ? `/results/${s.id}` : `/group/results?id=${s.id}`;
              const shareUrl =
                typeof window !== 'undefined'
                  ? `${window.location.origin}/${s.kind === 'solo' ? 'quiz?id=' : 'group?id='}${s.id}`
                  : '';

              return (
                <div
                  key={s.id + s.kind}
                  className="group relative flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/30 p-2.5 transition-colors hover:border-primary/40 hover:bg-secondary/60"
                >
                  <Link
                    href={resultsUrl}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-1 flex-col min-w-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-black uppercase tracking-tight ${
                          s.kind === 'solo'
                            ? 'bg-candy-lime/20 text-candy-lime'
                            : 'bg-candy-blue/20 text-candy-blue'
                        }`}
                      >
                        {s.kind}
                      </span>
                      <span className="truncate text-xs font-bold lowercase text-foreground group-hover:text-primary transition-colors">
                        {s.title}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.kind === 'solo'
                        ? `${s.count} question${s.count === 1 ? '' : 's'}`
                        : `${s.memberCount} friends · ${s.count} question${s.count === 1 ? '' : 's'}`}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                      title="see results"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(resultsUrl);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                      title="copy link"
                      onClick={(e) => copyLink(e, shareUrl)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="my-2.5" />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-1.5 px-0.5">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 justify-center rounded-xl text-xs font-bold"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/create">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-primary" />
              solo spill
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 justify-center rounded-xl text-xs font-bold"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/group/create">
              <Users className="mr-1.5 h-3.5 w-3.5 text-candy-blue" />
              group spill
            </Link>
          </Button>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={logout}
          className="rounded-xl text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

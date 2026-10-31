"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Users, Crown, RefreshCw, PlusCircle, Share2, MessageCircle, Copy, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type Group, type GroupVote } from '@/lib/types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const TILES = ['tile-1', 'tile-2', 'tile-3', 'tile-4', 'tile-5', 'tile-6'];

export function GroupResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [votes, setVotes] = useState<GroupVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedRecap, setCopiedRecap] = useState(false);

  const fetchData = useCallback(async () => {
    const id = searchParams.get('id');
    if (!id) { router.push('/'); return; }
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'groups', id));
      if (!snap.exists()) { setNotFound(true); return; }
      setGroup({ id: snap.id, ...snap.data() } as Group);

      const vq = query(collection(db, 'groupVotes'), where('groupId', '==', id));
      const vs = await getDocs(vq);
      setVotes(vs.docs.map((d) => ({ id: d.id, ...d.data() } as GroupVote)));
    } catch (e) {
      console.error('Error fetching group results: ', e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [searchParams, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const shareGroupLink = () => {
    if (!group) return;
    const url = `${window.location.origin}/group?id=${group.id}`;
    navigator.clipboard.writeText(url).then(
      () => toast({ title: 'link copied!', description: 'drop it in your group chat.' }),
      () => toast({ variant: 'destructive', title: "couldn't copy", description: 'please copy URL manually.' })
    );
  };

  const shareWhatsApp = () => {
    if (!group) return;
    const url = `${window.location.origin}/group?id=${group.id}`;
    const text = encodeURIComponent(`check out the tea on "${group.name}":\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const copyRecapSummary = () => {
    if (!group) return;
    let recap = `*spill the tea results: ${group.name}*\n\n`;
    group.questions.forEach((q, i) => {
      const qType = q.type || 'member_pick';
      recap += `${i + 1}. *${q.text}*\n`;
      if (qType === 'member_pick') {
        const { ranked } = tallyFor(q.id);
        const winner = ranked[0];
        if (winner && winner.count > 0) {
          recap += `winner: ${winner.member} (${winner.count} votes)\n\n`;
        } else {
          recap += `no votes yet\n\n`;
        }
      } else if (qType === 'behavior_roast') {
        const list = getRoastsFor(q.id);
        if (list.length > 0) {
          list.slice(0, 3).forEach(r => {
            recap += `on ${r.target}: "${r.text}"\n`;
          });
          recap += `\n`;
        }
      } else if (qType === 'short_answer') {
        const list = getShortAnswersFor(q.id);
        if (list.length > 0) {
          list.slice(0, 3).forEach(r => {
            recap += `• "${r.text}"\n`;
          });
          recap += `\n`;
        }
      }
    });
    navigator.clipboard.writeText(recap).then(() => {
      setCopiedRecap(true);
      toast({ title: 'recap copied!', description: 'ready to paste into WhatsApp.' });
      setTimeout(() => setCopiedRecap(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (notFound || !group) {
    return (
      <div className="w-full max-w-3xl text-center">
        <p className="text-muted-foreground">this group doesn't exist (or the link is broken).</p>
        <Button onClick={() => router.push('/')} className="mt-4"><Home className="mr-2 h-4 w-4" /> home</Button>
      </div>
    );
  }

  // tally votes per member_pick question
  const tallyFor = (questionId: string) => {
    const counts: Record<string, number> = {};
    const votersForMember: Record<string, string[]> = {};
    group.members.forEach((m) => {
      counts[m] = 0;
      votersForMember[m] = [];
    });
    votes.forEach((v) => {
      const pick = v.picks?.[questionId];
      if (pick && pick in counts) {
        counts[pick] += 1;
        if (v.isAnonymous === false && v.voterName) {
          votersForMember[pick].push(v.voterName);
        }
      }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const ranked = group.members
      .map((m) => ({ member: m, count: counts[m], voters: votersForMember[m] || [] }))
      .sort((a, b) => b.count - a.count);
    const topCount = ranked[0]?.count ?? 0;
    return { ranked, total, topCount };
  };

  // gather roasts for a question
  const getRoastsFor = (questionId: string) => {
    const list: { target: string; text: string; author?: string; isAnonymous: boolean }[] = [];
    votes.forEach((v) => {
      const isAnon = v.isAnonymous !== false;
      const authorName = isAnon ? undefined : (v.voterName || 'friend');
      const r = v.roasts?.[questionId];
      if (r) {
        if (r.targetMember && r.text?.trim()) {
          list.push({ target: r.targetMember, text: r.text.trim(), author: authorName, isAnonymous: isAnon });
        }
        if (r.allMembers) {
          Object.entries(r.allMembers).forEach(([m, txt]) => {
            if (txt && txt.trim()) {
              list.push({ target: m, text: txt.trim(), author: authorName, isAnonymous: isAnon });
            }
          });
        }
      }
    });
    return list;
  };

  // gather short answers for a question
  const getShortAnswersFor = (questionId: string) => {
    const list: { text: string; author?: string; isAnonymous: boolean }[] = [];
    votes.forEach((v) => {
      const isAnon = v.isAnonymous !== false;
      const authorName = isAnon ? undefined : (v.voterName || 'friend');
      const ans = v.shortAnswers?.[questionId];
      if (ans && ans.trim()) {
        list.push({ text: ans.trim(), author: authorName, isAnonymous: isAnon });
      }
    });
    return list;
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="h-24" />

      {/* banner */}
      <div className="ngl-grad relative overflow-hidden rounded-3xl p-8 text-white md:p-10">
        <Users aria-hidden className="pointer-events-none absolute -right-4 top-4 h-28 w-28 text-white/15" strokeWidth={2.2} />
        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">the group has spoken</span>
            <h1 className="display mt-3 text-fluid-xl font-black lowercase leading-[0.9]">{group.name}</h1>
            <p className="mt-3 text-sm font-semibold text-white/85">
              <span className="font-mono">{votes.length}</span>{' '}
              {votes.length === 1 ? 'person voted' : 'people voted'} · {group.members.length} in the group
            </p>
          </div>
          <div className="flex flex-wrap w-full gap-2 sm:w-auto">
            <Button onClick={shareGroupLink} variant="secondary" className="flex-1 bg-white/20 text-white hover:bg-white/30 sm:flex-none">
              <Share2 className="mr-2 h-4 w-4" /> invite
            </Button>
            <Button onClick={fetchData} variant="secondary" className="flex-1 bg-white/20 text-white hover:bg-white/30 sm:flex-none">
              <RefreshCw className="mr-2 h-4 w-4" /> refresh
            </Button>
            <Button onClick={() => router.push('/')} className="flex-1 bg-white text-ink hover:bg-white/90 sm:flex-none">
              <Home className="mr-2 h-4 w-4" /> home
            </Button>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/20 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={copyRecapSummary}
            className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
          >
            {copiedRecap ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
            {copiedRecap ? 'copied recap!' : 'copy whatsapp recap'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={shareWhatsApp}
            className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" /> share results on whatsapp
          </Button>
        </div>
      </div>

      {votes.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <p>no votes yet, share the group link so everyone can spill.</p>
            <Button onClick={shareGroupLink} className="mt-4">
              <Share2 className="mr-2 h-4 w-4" /> copy invite link
            </Button>
          </CardContent>
        </Card>
      ) : (
        group.questions.map((q, qi) => {
          const qType = q.type || 'member_pick';

          return (
            <Card key={q.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 font-mono text-sm font-bold text-primary">{String(qi + 1).padStart(2, '0')}</span>
                    <div>
                      <h2 className="text-xl font-black lowercase leading-tight">{q.text}</h2>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 ${
                        qType === 'behavior_roast'
                          ? 'bg-candy-pink/15 text-candy-pink border border-candy-pink/30'
                          : qType === 'short_answer'
                          ? 'bg-candy-purple/15 text-candy-purple border border-candy-purple/30'
                          : 'bg-candy-blue/15 text-candy-blue border border-candy-blue/30'
                      }`}>
                        {qType === 'behavior_roast' ? 'roast habit' : qType === 'short_answer' ? 'confession' : 'vote'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. MEMBER PICK RESULTS */}
                {qType === 'member_pick' && (() => {
                  const { ranked, total, topCount } = tallyFor(q.id);
                  return (
                    <div className="space-y-2.5">
                      {ranked.map(({ member, count, voters }, i) => {
                        const pct = total ? (count / total) * 100 : 0;
                        const isWinner = count > 0 && count === topCount;
                        const colorIdx = group.members.indexOf(member);
                        return (
                          <div key={member} className="space-y-1">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 flex-1 overflow-hidden rounded-xl bg-secondary/50">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                                  transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                                  className={`absolute inset-y-0 left-0 rounded-xl ${TILES[colorIdx % TILES.length]} ${isWinner ? 'opacity-100' : 'opacity-70'}`}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-3">
                                  <span className="flex items-center gap-1.5 font-bold lowercase text-foreground">
                                    {isWinner && <Crown className="h-4 w-4 text-primary" />}
                                    {member}
                                  </span>
                                  <span className="font-mono text-sm font-bold text-foreground/90">
                                    {count} · {pct.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            {voters && voters.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pl-2 text-[11px] text-muted-foreground">
                                <span className="font-semibold text-foreground/80">voted by:</span>
                                {voters.map((v, vIdx) => (
                                  <span key={vIdx} className="rounded-md bg-secondary/80 px-1.5 py-0.5 font-bold text-foreground">
                                    {v}
                                  </span>
                                ))}
                                {count > voters.length && (
                                  <span className="text-[10px] text-muted-foreground">
                                    (+{count - voters.length} anon)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <p className="text-right text-xs font-semibold text-muted-foreground">
                        {total} {total === 1 ? 'vote' : 'votes'}
                      </p>
                    </div>
                  );
                })()}

                {/* 2. BEHAVIOR ROAST RECEIPTS */}
                {qType === 'behavior_roast' && (() => {
                  const roastsList = getRoastsFor(q.id);
                  return (
                    <div className="space-y-3">
                      {roastsList.map((roast, rIdx) => {
                        const colorIdx = group.members.indexOf(roast.target);
                        return (
                          <div key={rIdx} className="rounded-2xl border-2 border-border bg-secondary/30 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs font-bold">
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white ${TILES[colorIdx >= 0 ? colorIdx % TILES.length : 0]}`}>
                                  {roast.target.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="text-foreground">on {roast.target}</span>
                              </span>
                              {roast.isAnonymous ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                                  <ShieldCheck className="h-3 w-3 text-candy-lime" /> 100% anon
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-candy-blue bg-candy-blue/10 px-2 py-0.5 rounded-full">
                                  <UserCheck className="h-3 w-3" /> by {roast.author}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold leading-relaxed">
                              "{roast.text}"
                            </p>
                          </div>
                        );
                      })}
                      {roastsList.length === 0 && (
                        <p className="text-sm text-muted-foreground italic py-2">no roasts submitted yet for this question.</p>
                      )}
                      <p className="text-right text-xs font-semibold text-muted-foreground">
                        {roastsList.length} {roastsList.length === 1 ? 'spill' : 'spills'}
                      </p>
                    </div>
                  );
                })()}

                {/* 3. SHORT ANSWER CONFESSIONS */}
                {qType === 'short_answer' && (() => {
                  const shortList = getShortAnswersFor(q.id);
                  return (
                    <div className="space-y-3">
                      {shortList.map((item, sIdx) => (
                        <div key={sIdx} className="rounded-2xl border-2 border-border bg-secondary/30 p-4 space-y-1">
                          <div className="flex items-center justify-end">
                            {item.isAnonymous ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                                <ShieldCheck className="h-3 w-3 text-candy-lime" /> 100% anon
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-candy-blue bg-candy-blue/10 px-2 py-0.5 rounded-full">
                                <UserCheck className="h-3 w-3" /> by {item.author}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold leading-relaxed">
                            "{item.text}"
                          </p>
                        </div>
                      ))}
                      {shortList.length === 0 && (
                        <p className="text-sm text-muted-foreground italic py-2">no confessions submitted yet for this question.</p>
                      )}
                      <p className="text-right text-xs font-semibold text-muted-foreground">
                        {shortList.length} {shortList.length === 1 ? 'confession' : 'confessions'}
                      </p>
                    </div>
                  );
                })()}

              </CardContent>
            </Card>
          );
        })
      )}

      <div className="flex flex-col items-center gap-2 pb-10 pt-4 sm:flex-row sm:justify-center">
        <Button onClick={() => router.push('/group/create')} size="lg" className="w-full max-w-xs sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> make your own group
        </Button>
      </div>
    </div>
  );
}

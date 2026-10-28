"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users, Check, UserPlus, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { type Group, type RoastAnswer, type GroupQuestion } from '@/lib/types';
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Deterministic candy accent per member index.
const TILES = ['tile-1', 'tile-2', 'tile-3', 'tile-4', 'tile-5', 'tile-6'];

const SUGGESTED_ROASTS = [
  "cancels plans at the 11th hour",
  "takes 4 business days to text back",
  "always 45 mins late leaving now",
  "steals food from everyone's plate",
  "disappears when the bill arrives",
  "overthinks literally every text",
];

export function GroupVote() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);

  // Identity selection state
  const [voterName, setVoterName] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [joining, setJoining] = useState(false);

  // Voting answers state
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [roasts, setRoasts] = useState<Record<string, RoastAnswer>>({});
  const [roastModes, setRoastModes] = useState<Record<string, 'single' | 'all'>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) { router.push('/'); return; }
    const fetchGroup = async () => {
      try {
        const snap = await getDoc(doc(db, 'groups', id));
        if (snap.exists()) {
          const g = { id: snap.id, ...snap.data() } as Group;
          setGroup(g);
          // Check saved voter identity
          const saved = localStorage.getItem(`group_voter_${g.id}`);
          if (saved && (g.members || []).some(m => m.toLowerCase() === saved.toLowerCase())) {
            setVoterName(saved);
          }
        } else {
          console.error('Group not found');
          router.push('/');
        }
      } catch (e) {
        console.error('Failed to fetch group: ', e);
        router.push('/');
      } finally {
        setLoaded(true);
      }
    };
    fetchGroup();
  }, [searchParams, router]);

  const selectIdentity = (name: string) => {
    setVoterName(name);
    if (group) {
      localStorage.setItem(`group_voter_${group.id}`, name);
    }
  };

  const joinSquad = async () => {
    const clean = newMemberName.trim();
    if (!clean || !group) return;
    if (group.members.some(m => m.toLowerCase() === clean.toLowerCase())) {
      selectIdentity(clean);
      setNewMemberName('');
      return;
    }
    setJoining(true);
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        members: arrayUnion(clean),
      });
      setGroup({
        ...group,
        members: [...group.members, clean],
      });
      selectIdentity(clean);
      setNewMemberName('');
      toast({ title: 'joined the squad!', description: "you're in! now spill your tea." });
    } catch (e) {
      console.warn('Firestore update warning, proceeding locally: ', e);
      setGroup({
        ...group,
        members: [...group.members, clean],
      });
      selectIdentity(clean);
      setNewMemberName('');
      toast({ title: 'joined the squad!', description: "you're in! now spill your tea." });
    } finally {
      setJoining(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast({ title: 'link copied!', description: 'drop it in your group chat.' }),
      () => toast({ variant: 'destructive', title: "couldn't copy", description: 'please copy URL manually.' })
    );
  };

  if (!loaded || !group) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="mt-2 h-4 w-full" />
        </CardHeader>
        <CardContent><Skeleton className="h-52 w-full" /></CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  // identity selection step
  if (!voterName) {
    return (
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="ngl-grad text-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              <Users className="h-4 w-4" /> {group.name}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={copyShareLink}
              className="h-8 bg-white/20 text-white hover:bg-white/30 text-xs font-bold"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> invite friends
            </Button>
          </div>
          <h2 className="display text-3xl font-black lowercase leading-tight text-white">
            who are you?
          </h2>
          <p className="text-sm font-semibold text-white/85 mt-1">
            tap your name to enter the spill, or add yourself to the squad!
          </p>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              choose your profile from the squad:
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.members.map((m, i) => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.97 }}
                  data-cursor="hover"
                  onClick={() => selectIdentity(m)}
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border-2 border-border bg-secondary/30 p-3 text-left transition-all hover:border-primary/50"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white ${TILES[i % TILES.length]}`}>
                    {m.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="flex-1 font-bold lowercase truncate">{m}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-border bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold lowercase text-sm">
              <UserPlus className="h-4 w-4 text-primary" />
              <span>not on the list? join the spill!</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="type your name..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); joinSquad(); } }}
              />
              <Button onClick={joinSquad} disabled={joining || !newMemberName.trim()}>
                {joining ? 'joining…' : 'join squad'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // question logic
  const question: GroupQuestion = group.questions[index] || { id: 'default', text: '' };
  const qType = question.type || 'member_pick';
  const progress = ((index + 1) / group.questions.length) * 100;

  // Member pick handlers
  const picked = picks[question.id];
  const choose = (member: string) => setPicks({ ...picks, [question.id]: member });

  // Roast handlers
  const currentRoast = roasts[question.id] || {};
  const currentRoastMode = roastModes[question.id] || 'single';

  const setRoastMode = (mode: 'single' | 'all') => {
    setRoastModes({ ...roastModes, [question.id]: mode });
  };

  const setRoastTarget = (targetMember: string) => {
    setRoasts({
      ...roasts,
      [question.id]: {
        ...currentRoast,
        targetMember,
      },
    });
  };

  const setRoastText = (text: string) => {
    setRoasts({
      ...roasts,
      [question.id]: {
        ...currentRoast,
        text,
      },
    });
  };

  const setAllMembersRoast = (member: string, text: string) => {
    setRoasts({
      ...roasts,
      [question.id]: {
        ...currentRoast,
        allMembers: {
          ...(currentRoast.allMembers || {}),
          [member]: text,
        },
      },
    });
  };

  // Short answer handler
  const currentShort = shortAnswers[question.id] || '';
  const setShortAnswer = (text: string) => {
    setShortAnswers({ ...shortAnswers, [question.id]: text });
  };

  // Check if user answered enough to proceed
  const canProceed = () => {
    if (qType === 'member_pick') {
      return !!picked;
    }
    if (qType === 'behavior_roast') {
      if (currentRoastMode === 'all') {
        const values = Object.values(currentRoast.allMembers || {});
        return values.some(v => v && v.trim().length > 0);
      }
      return !!currentRoast.targetMember && !!currentRoast.text?.trim();
    }
    if (qType === 'short_answer') {
      return !!currentShort.trim();
    }
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'groupVotes'), {
        groupId: group.id,
        voterName,
        picks,
        roasts,
        shortAnswers,
        createdAt: new Date().toISOString(),
      });
      router.push(`/group/results?id=${group.id}`);
    } catch (e) {
      console.error('Error saving vote: ', e);
      toast({ variant: 'destructive', title: 'vote failed', description: 'there was an error saving your votes.' });
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (index < group.questions.length - 1) setIndex(index + 1);
    else submit();
  };
  const handlePrev = () => { if (index > 0) setIndex(index - 1); };

  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <CardHeader className="ngl-grad text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              <Users className="h-4 w-4" /> {group.name}
            </span>
            <span className="text-[11px] font-semibold text-white/70">
              (as {voterName})
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-white/90">
            {String(index + 1).padStart(2, '0')} / {String(group.questions.length).padStart(2, '0')}
          </span>
        </div>
        <div className="mb-6"><Progress value={progress} className="h-1.5 bg-black/25" /></div>
        <h2 className="display text-3xl font-black lowercase leading-tight text-white">{question.text}</h2>
        <span className="mt-2 inline-block w-fit text-[11px] font-bold uppercase tracking-wider rounded-md px-2.5 py-0.5 bg-black/25 text-white/90">
          {qType === 'behavior_roast' ? 'behaviour roast' : qType === 'short_answer' ? 'confession' : 'vote'}
        </span>
      </CardHeader>

      <CardContent className="min-h-[220px] py-6">
        <AnimatePresence mode="wait">
          {/* 1. MEMBER PICK (Who is most...) */}
          {qType === 'member_pick' && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {group.members.map((m, i) => {
                const active = picked === m;
                return (
                  <motion.button
                    key={m}
                    whileTap={{ scale: 0.97 }}
                    data-cursor="hover"
                    onClick={() => choose(m)}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                      active ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-primary/50'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${TILES[i % TILES.length]}`}>
                      {m.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex-1 font-bold lowercase">{m}</span>
                    {active && <Check className="h-5 w-5 shrink-0 text-primary" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* 2. BEHAVIOR ROAST */}
          {qType === 'behavior_roast' && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Single vs All toggle */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant={currentRoastMode === 'single' ? 'default' : 'outline'}
                  onClick={() => setRoastMode('single')}
                  className="rounded-full text-xs font-bold"
                >
                  spill on 1 member
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant={currentRoastMode === 'all' ? 'default' : 'outline'}
                  onClick={() => setRoastMode('all')}
                  className="rounded-full text-xs font-bold"
                >
                  spill for all members (option)
                </Button>
              </div>

              {currentRoastMode === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      which member are you spilling tea about?
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {group.members.map((m, i) => {
                        const active = currentRoast.targetMember === m;
                        return (
                          <motion.button
                            key={m}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setRoastTarget(m)}
                            className={`flex items-center gap-2 rounded-xl border-2 p-2.5 text-left text-xs font-bold transition-all ${
                              active ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-primary/50'
                            }`}
                          >
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white ${TILES[i % TILES.length]}`}>
                              {m.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="truncate flex-1">{m}</span>
                            {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      what behaviour or annoying habit gets on your nerves?
                    </p>
                    <Textarea
                      placeholder={currentRoast.targetMember ? `spill about ${currentRoast.targetMember}...` : "select a member above and spill the tea..."}
                      value={currentRoast.text || ''}
                      onChange={(e) => setRoastText(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Quick roast idea chips */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" /> quick roast ideas (tap to use):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_ROASTS.map((r, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => setRoastText(r)}
                          className="rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* All members mode */
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <p className="text-xs text-muted-foreground">
                    drop a quick roast or habit for each squad member (leave blank if innocent!):
                  </p>
                  {group.members.map((m, i) => (
                    <div key={m} className="rounded-xl border border-border bg-secondary/20 p-2.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white ${TILES[i % TILES.length]}`}>
                          {m.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold lowercase">{m}</span>
                      </div>
                      <Input
                        placeholder={`annoying habit of ${m}...`}
                        value={currentRoast.allMembers?.[m] || ''}
                        onChange={(e) => setAllMembersRoast(m, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 3. SHORT ANSWER CONFESSION */}
          {qType === 'short_answer' && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                spill your confession or unfiltered truth:
              </p>
              <Textarea
                placeholder="drop anonymous tea for the squad..."
                value={currentShort}
                onChange={(e) => setShortAnswer(e.target.value)}
                className="min-h-[120px]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Button variant="outline" onClick={handlePrev} disabled={index === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> prev
        </Button>
        <Button onClick={handleNext} disabled={!canProceed() || submitting}>
          {index === group.questions.length - 1 ? (submitting ? 'saving…' : 'see results') : 'next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

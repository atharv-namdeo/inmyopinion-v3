"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, Trash2, Wand2, Users, Share2, Save, Home, Pencil, PartyPopper, Check, X, UserPlus, Sparkles, MessageCircle, ShieldCheck, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { type GroupQuestion, type GroupQuestionType, type Group, type AnonymityMode } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const SAMPLE_QUESTIONS: { text: string; type: GroupQuestionType }[] = [
  { text: "who's the absolute most weird or unhinged?", type: 'member_pick' },
  { text: "who's most likely to get married first?", type: 'member_pick' },
  { text: "which behaviour of a friend secretly gets on your nerves?", type: 'behavior_roast' },
  { text: "who takes 5 to 7 business days to reply to a simple text?", type: 'member_pick' },
  { text: "who spends money like a billionaire while having ₹50 in their bank account?", type: 'member_pick' },
  { text: "who has the absolute worst sleep schedule?", type: 'member_pick' },
  { text: "who is the group's biggest tea collector & gossip archive?", type: 'member_pick' },
  { text: "if we were in a horror movie, who gets eliminated in the first 5 minutes?", type: 'member_pick' },
  { text: "what is an unspoken funny truth or confession about this group that nobody says out loud?", type: 'short_answer' },
  { text: "if this friend was arrested today, what hilarious or bizarre crime would it be for?", type: 'behavior_roast' },
  { text: "who will cancel plans at the very last minute with the wildest excuse?", type: 'member_pick' },
  { text: "who is most likely to become rich and still borrow your Netflix account?", type: 'member_pick' },
  { text: "who has the most chaotic screen time on their phone?", type: 'member_pick' },
  { text: "who falls in love after 2 days of texting someone new?", type: 'member_pick' },
  { text: "who is the group therapist who never follows their own advice?", type: 'member_pick' },
  { text: "what is the most hilarious or chaotic core memory you share with this friend?", type: 'behavior_roast' },
  { text: "who talks the biggest game before doing absolutely nothing?", type: 'member_pick' },
  { text: "who gets way too competitive and screams during a simple board game?", type: 'member_pick' },
  { text: "what is the most iconic quote or catchphrase this friend always says?", type: 'behavior_roast' },
  { text: "who would accidentally leak classified secrets because they cannot keep tea?", type: 'member_pick' },
  { text: "what is one brutally honest piece of advice this friend needs to hear?", type: 'behavior_roast' },
  { text: "who is the mom or dad of the squad who always brings snacks?", type: 'member_pick' },
  { text: "who leaves everyone on read but posts Instagram stories 2 minutes later?", type: 'member_pick' },
  { text: "if our squad wrote a book together, what would the embarrassing title be?", type: 'short_answer' },
  { text: "who orders the most expensive item and then asks to split the bill equally?", type: 'member_pick' },
  { text: "who would cry during an animated kids movie in the theatre?", type: 'member_pick' },
  { text: "who is most likely to survive a zombie apocalypse purely on luck?", type: 'member_pick' },
  { text: "what is one red flag and one green flag about this friend?", type: 'behavior_roast' },
  { text: "who gets lost even while using Google Maps with voice on?", type: 'member_pick' },
  { text: "what is an inside joke between this group that no outsider will ever understand?", type: 'short_answer' },
];

const SUGGESTED = SAMPLE_QUESTIONS.map(q => q.text);

const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function CreateGroupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('the squad');
  const [anonymityMode, setAnonymityMode] = useState<AnonymityMode>('allow_choice');
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');
  const [questions, setQuestions] = useState<GroupQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<GroupQuestionType>('member_pick');

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const [isCreated, setIsCreated] = useState(false);
  const [groupLink, setGroupLink] = useState('');

  useEffect(() => {
    const id = searchParams.get('groupId');
    if (id && user) {
      const fetchGroup = async () => {
        const snap = await getDoc(doc(db, 'groups', id));
        if (snap.exists() && snap.data().userId === user.uid) {
          const g = snap.data() as Group;
          setGroupId(snap.id);
          setGroupName(g.name);
          if (g.anonymityMode) setAnonymityMode(g.anonymityMode);
          setMembers(g.members ?? []);
          setQuestions((g.questions ?? []).map((q, i) => ({ ...q, id: `db-${i}-${Date.now()}` })));
        } else {
          toast({ variant: 'destructive', title: 'group not found', description: "this group doesn't exist or isn't yours to edit." });
          router.push('/group/create');
        }
      };
      fetchGroup();
    }
  }, [searchParams, user, router, toast]);

  // members
  const addMember = () => {
    const name = newMember.trim();
    if (!name) return;
    if (members.some((m) => m.toLowerCase() === name.toLowerCase())) {
      toast({ variant: 'destructive', title: 'already added', description: `${name} is already in the group.` });
      return;
    }
    setMembers([...members, name]);
    setNewMember('');
  };
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));

  // questions
  const addQuestion = (text: string, type: GroupQuestionType = newQuestionType) => {
    const t = text.trim();
    if (!t) return;
    if (questions.some((q) => q.text.toLowerCase() === t.toLowerCase())) return;
    setQuestions([...questions, { id: uid('q'), text: t, type }]);
    setNewQuestion('');
  };

  const addAllSampleQuestions = () => {
    const existing = new Set(questions.map((q) => q.text.toLowerCase()));
    const toAdd = SAMPLE_QUESTIONS.filter((sq) => !existing.has(sq.text.toLowerCase())).map((sq) => ({
      id: uid('q'),
      text: sq.text,
      type: sq.type,
    }));
    if (toAdd.length === 0) {
      toast({ title: 'already added', description: 'all sample questions are already in your list.' });
      return;
    }
    setQuestions([...questions, ...toAdd]);
    toast({ title: 'questions added!', description: `added ${toAdd.length} sample questions to your group.` });
  };

  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const startEditing = (i: number) => { setEditingIndex(i); setEditingText(questions[i].text); };
  const cancelEditing = () => { setEditingIndex(null); setEditingText(''); };
  const saveEditing = (i: number) => {
    const t = editingText.trim();
    if (!t) return;
    const next = [...questions];
    next[i] = { ...next[i], text: t };
    setQuestions(next);
    cancelEditing();
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast({ title: 'copied!', description: message }),
      () => toast({ variant: 'destructive', title: "couldn't copy", description: 'copy the link manually?' })
    );
  };

  const saveGroup = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'hold up', description: 'you need to be logged in to make a group.' });
      return;
    }
    if (members.length < 2) {
      toast({ variant: 'destructive', title: 'hold up', description: 'add at least 2 people to the group.' });
      return;
    }
    if (questions.length === 0) {
      toast({ variant: 'destructive', title: 'hold up', description: 'add at least one question, bestie.' });
      return;
    }

    const groupData = {
      userId: user.uid,
      name: groupName || 'the squad',
      members,
      questions,
      anonymityMode,
      createdAt: serverTimestamp(),
    };

    try {
      let id;
      if (groupId) {
        await updateDoc(doc(db, 'groups', groupId), groupData);
        id = groupId;
      } else {
        const ref = await addDoc(collection(db, 'groups'), groupData);
        id = ref.id;
        setGroupId(ref.id);
      }
      toast({ title: groupId ? 'group updated' : 'group saved', description: 'ready to share with the gc.' });
      return id;
    } catch (error) {
      console.error('Error saving group: ', error);
      toast({ variant: 'destructive', title: 'save failed', description: "couldn't save your group. try again?" });
    }
  };

  const createAndShare = async () => {
    const id = await saveGroup();
    if (!id) return;
    const url = `${window.location.origin}/group?id=${id}`;
    setGroupLink(url);
    setIsCreated(true);
    copyToClipboard(url, 'link copied! drop it in the gc');
  };

  const downloadStory = async () => {
    const W = 1080, H = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const root = getComputedStyle(document.documentElement);
    const fDisp = (root.getPropertyValue('--font-display').trim() || 'sans-serif') + ', sans-serif';
    const fBody = (root.getPropertyValue('--font-grotesk').trim() || 'sans-serif') + ', sans-serif';
    try { await (document as any).fonts?.ready; } catch {}

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#7c3aed');
    bg.addColorStop(0.45, '#4f46e5');
    bg.addColorStop(0.75, '#2563eb');
    bg.addColorStop(1, '#06b6d4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const blob = (x: number, y: number, r: number, c: string, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = a; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    };
    blob(140, 300, 460, '#ff5a3c', 0.55);
    blob(980, 520, 480, '#ff3ea5', 0.5);
    blob(940, 1560, 560, '#b5ff3c', 0.3);
    blob(160, 1640, 520, '#ffd23c', 0.38);

    const candy = ['#ff5a3c', '#ff3ea5', '#b5ff3c', '#ffd23c', '#ffffff'];
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * W, y = Math.random() * H, s = 16 + Math.random() * 28, rot = Math.random() * Math.PI;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.globalAlpha = 0.85; ctx.fillStyle = candy[i % candy.length];
      ctx.beginPath(); (ctx as any).roundRect(-s / 2, -s / 4, s, s / 2, 6); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // top row: wordmark + anon pill
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
    ctx.font = `800 58px ${fDisp}`;
    ctx.fillText('spill', 80, 190);
    ctx.save();
    ctx.translate(880, 165); ctx.rotate(-0.08);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); (ctx as any).roundRect(-160, -42, 320, 84, 42); ctx.fill();
    ctx.fillStyle = '#4f46e5'; ctx.textAlign = 'center';
    ctx.font = `800 34px ${fBody}`;
    ctx.fillText('100% ANON', 0, 12);
    ctx.restore();

    // kicker
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `700 46px ${fBody}`;
    ctx.fillText('VOTE ON THE GROUP:', 80, 560);

    // title (group name): highlighted blocks
    const maxW = 900;
    const words = (groupName || 'the squad').trim().split(/\s+/);
    const wrap = (size: number) => {
      ctx.font = `900 ${size}px ${fDisp}`;
      const ls: string[] = []; let l = '';
      for (const w of words) {
        const t = l ? l + ' ' + w : w;
        if (ctx.measureText(t).width > maxW && l) { ls.push(l); l = w; } else { l = t; }
      }
      if (l) ls.push(l);
      return ls;
    };
    let fs = 118;
    let lines = wrap(fs);
    while (lines.length * (fs + 34) > 470 && fs > 56) { fs -= 10; lines = wrap(fs); }

    let y = 700;
    const lh = fs + 34;
    lines.forEach((ln, i) => {
      ctx.font = `900 ${fs}px ${fDisp}`;
      const w = ctx.measureText(ln).width;
      ctx.save();
      ctx.translate(80, y);
      ctx.rotate((i % 2 ? 1 : -1) * 0.012);
      ctx.fillStyle = candy[i % 4];
      ctx.beginPath(); (ctx as any).roundRect(-16, -fs + 12, w + 36, fs + 24, 18); ctx.fill();
      ctx.fillStyle = '#17123a'; ctx.textAlign = 'left';
      ctx.fillText(ln, 4, 0);
      ctx.restore();
      y += lh;
    });

    // stat
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `700 42px ${fBody}`;
    ctx.fillText(`${members.length} people · ${questions.length} question${questions.length === 1 ? '' : 's'}`, 84, y + 48);

    // link-sticker placeholder box
    const statBottom = y + 90;
    const footTop = 1790;
    // link-sticker placeholder box (compact, modern height)
    const bw = 880, bh = 150;
    const bx = (1080 - bw) / 2;
    const by = Math.max(statBottom + 20, statBottom + ((footTop - statBottom) - bh) / 2);

    ctx.save();
    ctx.setLineDash([18, 14]);
    ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath(); (ctx as any).roundRect(bx, by, bw, bh, 28); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `800 26px ${fBody}`;
    ctx.fillText('ADD LINK STICKER HERE', 540, by + 52);
    ctx.fillStyle = '#fff';
    ctx.font = `900 48px ${fDisp}`;
    ctx.fillText('vote on the group', 540, by + 112);

    // footer
    ctx.fillStyle = '#fff';
    ctx.font = `800 44px ${fDisp}`;
    ctx.fillText('spill', 540, 1850);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `600 30px ${fBody}`;
    ctx.fillText('what does the group really think?', 540, 1895);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'spill-group-story.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // success screen
  if (isCreated) {
    return (
      <Card className="mt-28 w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-candy-lime text-ink shadow-lg">
            <PartyPopper className="h-7 w-7" />
          </span>
          <CardTitle className="mt-4 text-3xl lowercase">{groupId ? 'group updated' : 'your group is live'}</CardTitle>
          <CardDescription>drop this link in the gc and let everyone vote anon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">share this link</p>
          <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-secondary/40 p-2">
            <Input readOnly value={groupLink} className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" />
            <Button onClick={() => copyToClipboard(groupLink, 'link copied! drop it in the gc')}>
              <Share2 className="mr-2 h-4 w-4" /> copy link
            </Button>
          </div>
          <Button
            className="mx-auto mt-4 flex w-full max-w-xs items-center justify-center gap-2"
            variant="outline"
            onClick={downloadStory}
          >
            share to your group
          </Button>
          <Button
            className="mx-auto flex w-full max-w-xs items-center justify-center gap-2"
            variant="outline"
            onClick={() => {
              const text = encodeURIComponent(`spill the tea: ${groupName}\nvote on the squad and spill anon tea:\n${groupLink}`);
              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            }}
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" /> share to whatsapp
          </Button>
          <Button
            className="mx-auto flex w-full max-w-xs items-center justify-center gap-2"
            variant="ghost"
            onClick={() => groupId && router.push(`/group/results?id=${groupId}`)}
          >
            <Users className="h-4 w-4" /> see live results
          </Button>
        </CardContent>
        <CardFooter className="flex-col justify-center gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" /> home
          </Button>
          <Button
            onClick={() => {
              setIsCreated(false); setGroupId(null); setGroupName('the squad');
              setMembers([]); setQuestions([]); router.push('/group/create');
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> new group
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // editor
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-2 pb-24 sm:px-4">
      <div className="mt-28 flex justify-center">
        <Button variant="outline" onClick={() => router.push('/')} className="w-full max-w-xs sm:w-auto">
          <Home className="mr-2 h-4 w-4" /> back to home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <span className="sticker mb-2 inline-flex w-fit bg-candy-blue text-white">group spill</span>
          <CardTitle className="flex items-center gap-2 text-3xl lowercase">
            <Users className="h-7 w-7 text-primary" />
            {groupId ? 'edit your group' : 'make a group spill'}
          </CardTitle>
          <CardDescription>
            add everyone in the group, then ask "who's most ___?". everyone votes anon & you all see the results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-lg font-semibold">group name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. the roommates, bio class, the gc"
              className="text-lg"
            />
          </div>

          {/* anonymity setting */}
          <div className="space-y-3 rounded-2xl border-2 border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> anonymity setting
              </Label>
              <span className="text-xs font-semibold text-muted-foreground">
                {anonymityMode === 'allow_choice'
                  ? 'friends choose'
                  : anonymityMode === 'always_anon'
                  ? '100% anonymous only'
                  : 'names shown'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAnonymityMode('allow_choice')}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  anonymityMode === 'allow_choice'
                    ? 'border-primary bg-primary/10 text-foreground font-bold shadow-sm'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-border/80'
                }`}
              >
                <span className="block text-xs font-bold text-foreground">voters choose</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">anonymous by default, option to reveal name</span>
              </button>
              <button
                type="button"
                onClick={() => setAnonymityMode('always_anon')}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  anonymityMode === 'always_anon'
                    ? 'border-primary bg-primary/10 text-foreground font-bold shadow-sm'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-border/80'
                }`}
              >
                <span className="block text-xs font-bold text-foreground">always anonymous</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">all roasts and votes are strictly anonymous</span>
              </button>
              <button
                type="button"
                onClick={() => setAnonymityMode('always_named')}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  anonymityMode === 'always_named'
                    ? 'border-primary bg-primary/10 text-foreground font-bold shadow-sm'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-border/80'
                }`}
              >
                <span className="block text-xs font-bold text-foreground">public names</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">everyone sees who voted and roasted</span>
              </button>
            </div>
          </div>

          {/* members */}
          <div className="space-y-3 rounded-2xl border-2 border-border bg-secondary/30 p-4">
            <h3 className="flex items-center gap-2 font-bold lowercase"><UserPlus className="h-5 w-5 text-primary" /> who's in the group? ({members.length})</h3>
            <div className="flex gap-2">
              <Input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
                placeholder="type a name & hit enter"
              />
              <Button onClick={addMember}><PlusCircle className="mr-2 h-4 w-4" /> add</Button>
            </div>
            {members.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {members.map((m, i) => (
                  <motion.span
                    key={m + i}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm font-semibold"
                  >
                    {m}
                    <button onClick={() => removeMember(i)} className="text-muted-foreground hover:text-destructive" aria-label={`remove ${m}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">these names become the options everyone votes between.</p>
          </div>

          {/* add question */}
          <div className="space-y-3 rounded-2xl border-2 border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold lowercase">add a question</h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewQuestionType('member_pick')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    newQuestionType === 'member_pick'
                      ? 'bg-candy-blue text-white shadow-sm'
                      : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  who's most... (vote)
                </button>
                <button
                  type="button"
                  onClick={() => setNewQuestionType('behavior_roast')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    newQuestionType === 'behavior_roast'
                      ? 'bg-candy-pink text-white shadow-sm'
                      : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  behaviour roast
                </button>
                <button
                  type="button"
                  onClick={() => setNewQuestionType('short_answer')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    newQuestionType === 'short_answer'
                      ? 'bg-candy-purple text-white shadow-sm'
                      : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  confession (text)
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder={
                  newQuestionType === 'behavior_roast'
                    ? "e.g. which behaviour of a friend secretly gets on your nerves?"
                    : newQuestionType === 'short_answer'
                    ? "e.g. what is an unspoken funny truth or confession about this group?"
                    : "e.g. who's the absolute most weird or unhinged?"
                }
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-[52px]"
              />
            </div>
            <Button onClick={() => addQuestion(newQuestion, newQuestionType)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> add question
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Card>
              <CardHeader>
                <CardTitle className="lowercase">your questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-border bg-secondary/20 p-4"
                  >
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <Textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEditing(index)}><Check className="mr-2 h-4 w-4" /> save</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}><X className="mr-2 h-4 w-4" /> cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Users className="mt-1 h-5 w-5 shrink-0 text-primary" />
                          <div>
                            <p className="font-semibold">{q.text}</p>
                            <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 ${
                              q.type === 'behavior_roast'
                                ? 'bg-candy-pink/15 text-candy-pink border border-candy-pink/30'
                                : q.type === 'short_answer'
                                ? 'bg-candy-purple/15 text-candy-purple border border-candy-purple/30'
                                : 'bg-candy-blue/15 text-candy-blue border border-candy-blue/30'
                            }`}>
                              {q.type === 'behavior_roast' ? 'roast habit' : q.type === 'short_answer' ? 'confession' : 'vote'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(index)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
              <CardFooter className="flex-col gap-2 sm:flex-row">
                <Button onClick={createAndShare} size="lg" disabled={questions.length === 0 || members.length < 2}>
                  <Share2 className="mr-2 h-5 w-5" />
                  {groupId ? 'update & get link' : 'make my group'}
                </Button>
                <Button onClick={saveGroup} size="lg" variant="secondary" disabled={questions.length === 0 || members.length < 2}>
                  <Save className="mr-2 h-5 w-5" />
                  {groupId ? 'update group' : 'save group'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold lowercase">
                <Wand2 className="text-primary" /> not sure what to ask?
              </h3>
              <CardDescription>{SAMPLE_QUESTIONS.length} curated question suggestions to get the tea flowing</CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={addAllSampleQuestions} className="w-fit">
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> add all sample questions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sq) => (
            <Button
              key={sq.text}
              variant="outline"
              size="sm"
              onClick={() => addQuestion(sq.text, sq.type)}
              className="h-auto min-h-9 py-2 px-3.5 whitespace-normal text-left justify-start leading-snug w-full sm:w-auto max-w-full break-words rounded-xl"
            >
              <PlusCircle className="mr-2 h-4 w-4 shrink-0 text-primary" />
              <span className="break-words text-xs">{sq.text}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

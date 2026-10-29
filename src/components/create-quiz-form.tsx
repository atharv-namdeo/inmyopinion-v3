
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Wand2, ListChecks, SlidersHorizontal, Check, X, Share2, Save, Home, Pencil, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { questions as suggestedQuestions } from '@/lib/questions';
import { type Question, type Quiz } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function CreateQuizForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { toast } = useToast();
 const { user } = useAuth();

 const [quizId, setQuizId] = useState<string | null>(null);

 const [quizTitle, setQuizTitle] = useState('my spill');
 const [questions, setQuestions] = useState<Question[]>([]);
 const [endMessage, setEndMessage] = useState('thanks for spilling');
 const [newQuestionText, setNewQuestionText] = useState('');
 const [newQuestionType, setNewQuestionType] = useState<'multiple-choice' |'sliding-bar'>('multiple-choice');
 const [options, setOptions] = useState<string[]>(['','']);

 const [editingIndex, setEditingIndex] = useState<number | null>(null);
 const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

 const [isQuizCreated, setIsQuizCreated] = useState(false);
 const [quizLink, setQuizLink] = useState('');

 useEffect(() => {
 const id = searchParams.get('quizId');
 if (id && user) {
 const fetchQuiz = async () => {
 const quizDoc = await getDoc(doc(db,"quizzes", id));
 if (quizDoc.exists() && quizDoc.data().userId === user.uid) {
 const existingQuiz = quizDoc.data() as Quiz;
 setQuizId(quizDoc.id);
 setQuizTitle(existingQuiz.title);
 setQuestions(existingQuiz.questions.map((q, i) => ({...q, id: `db-${i}-${Date.now()}` })));
 setEndMessage(existingQuiz.endMessage ||'thanks for spilling');
 } else {
 toast({
 variant: "destructive",
 title: "spill not found",
 description: "this spill doesn't exist or isn't yours to edit.",
 });
 router.push('/create');
 }
 };
 fetchQuiz();
 }
 }, [searchParams, user, router, toast]);

 const addQuestion = () => {
 if (newQuestionText.trim() ==='') return;

 const questionToAdd: Question = {
 id: `custom-${questions.length + 1}-${Date.now()}`,
 text: newQuestionText,
 type: newQuestionType,
 };

 if (newQuestionType ==='multiple-choice') {
 const validOptions = options.map(o => o.trim()).filter(o => o !=='');
 if (validOptions.length < 2) {
 toast({
 variant: "destructive",
 title: "hold up",
 description: "multiple-choice questions need at least 2 options.",
 });
 return;
 }
 questionToAdd.options = validOptions;
 }

 setQuestions([...questions, questionToAdd]);
 setNewQuestionText('');
 setNewQuestionType('multiple-choice');
 setOptions(['','']);
 };

 const addSuggestedQuestion = (question: Question) => {
 const questionWithUniqueId = {...question, id: `suggested-${question.id}-${Date.now()}` };
 if (!questions.some(q => q.text === questionWithUniqueId.text)) {
 setQuestions([...questions, questionWithUniqueId]);
 }
 };

 const removeQuestion = (index: number) => {
 setQuestions(questions.filter((_, i) => i !== index));
 };

 const handleOptionChange = (index: number, value: string) => {
 const newOptions = [...options];
 newOptions[index] = value;
 setOptions(newOptions);
 };

 const addOption = () => setOptions([...options,'']);

 const removeOption = (index: number) => {
 if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
 };

 const startEditing = (index: number) => {
 setEditingIndex(index);
 setEditingQuestion({...questions[index] });
 };

 const cancelEditing = () => {
 setEditingIndex(null);
 setEditingQuestion(null);
 };

 const saveEditing = (index: number) => {
 if (editingQuestion) {
 if (editingQuestion.type ==='multiple-choice') {
 const validOptions = (editingQuestion.options?? []).map(o => o.trim()).filter(o => o !=='');
 if (validOptions.length < 2) {
 toast({
 variant: "destructive",
 title: "hold up",
 description: "multiple-choice questions need at least 2 options.",
 });
 return;
 }
 editingQuestion.options = validOptions;
 }
 const newQuestions = [...questions];
 newQuestions[index] = editingQuestion;
 setQuestions(newQuestions);
 cancelEditing();
 }
 };

 const handleEditingQuestionChange = (field: keyof Question, value: any) => {
 if (editingQuestion) {
 const updatedQuestion = {...editingQuestion, [field]: value };
 if (field ==='type') {
 if (value ==='sliding-bar') {
 delete updatedQuestion.options;
 } else if (value ==='multiple-choice' &&!updatedQuestion.options) {
 updatedQuestion.options = ['',''];
 }
 }
 setEditingQuestion(updatedQuestion);
 }
 };

 const handleEditingOptionChange = (optIndex: number, value: string) => {
 if (editingQuestion && editingQuestion.options) {
 const newOptions = [...editingQuestion.options];
 newOptions[optIndex] = value;
 handleEditingQuestionChange('options', newOptions);
 }
 };

 const addEditingOption = () => {
 if (editingQuestion && editingQuestion.options) {
 handleEditingQuestionChange('options', [...editingQuestion.options,'']);
 }
 };

 const removeEditingOption = (optIndex: number) => {
 if (editingQuestion && editingQuestion.options && editingQuestion.options.length > 2) {
 handleEditingQuestionChange('options', editingQuestion.options.filter((_, i) => i !== optIndex));
 }
 };

 const copyToClipboard = (text: string, message: string) => {
 navigator.clipboard.writeText(text).then(
 () => toast({ title: "copied!", description: message }),
 () => toast({ variant: "destructive", title: "couldn't copy", description: "copy the link manually?" })
 );
 };

 const saveQuiz = async () => {
 if (!user) {
 toast({ variant: "destructive", title: "hold up", description: "you need to be logged in to save a spill." });
 return;
 }
 if (questions.length === 0) {
 toast({ variant: "destructive", title: "hold up", description: "add at least one question first, bestie." });
 return;
 }

 const quizData: Omit<Quiz,'id' |'createdAt'> & { createdAt: any } = {
 userId: user.uid,
 title: quizTitle ||'my spill',
 questions,
 endMessage,
 createdAt: serverTimestamp(),
 };

 try {
 let newQuizId;
 if (quizId) {
 await updateDoc(doc(db,"quizzes", quizId), quizData);
 newQuizId = quizId;
 } else {
 const docRef = await addDoc(collection(db,"quizzes"), quizData);
 newQuizId = docRef.id;
 setQuizId(docRef.id);
 }
 toast({
 title: quizId?"spill updated" : "spill saved",
 description: "your spill is ready to share.",
 });
 return newQuizId;
 } catch (error) {
 console.error("Error saving quiz: ", error);
 toast({ variant: "destructive", title: "save failed", description: "couldn't save your spill. try again?" });
 }
 };

 const createAndShareQuiz = async () => {
 const newQuizId = await saveQuiz();
 if (!newQuizId) return;
 const url = `${window.location.origin}/quiz?id=${newQuizId}`;
 setQuizLink(url);
 setIsQuizCreated(true);
 copyToClipboard(url,"link copied! go share it");
 };

 const downloadStory = async (title: string, qCount: number) => {
 const W = 1080, H = 1920;
 const canvas = document.createElement('canvas');
 canvas.width = W; canvas.height = H;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 // brand fonts (next/font hashed families, read off CSS vars)
 const root = getComputedStyle(document.documentElement);
 const fDisp = (root.getPropertyValue('--font-display').trim() || 'sans-serif') + ', sans-serif';
 const fBody = (root.getPropertyValue('--font-grotesk').trim() || 'sans-serif') + ', sans-serif';
 try { await (document as any).fonts?.ready; } catch {}

 // ---- background: bold brand gradient ----
 const bg = ctx.createLinearGradient(0, 0, W, H);
 bg.addColorStop(0, '#7c3aed');
 bg.addColorStop(0.45, '#4f46e5');
 bg.addColorStop(0.75, '#2563eb');
 bg.addColorStop(1, '#06b6d4');
 ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

 // soft candy blobs (maximalist colour)
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

 // confetti
 const candy = ['#ff5a3c', '#ff3ea5', '#b5ff3c', '#ffd23c', '#ffffff'];
 for (let i = 0; i < 30; i++) {
 const x = Math.random() * W, y = Math.random() * H, s = 16 + Math.random() * 28, rot = Math.random() * Math.PI;
 ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
 ctx.globalAlpha = 0.85; ctx.fillStyle = candy[i % candy.length];
 ctx.beginPath(); (ctx as any).roundRect(-s / 2, -s / 4, s, s / 2, 6); ctx.fill();
 ctx.restore();
 }
 ctx.globalAlpha = 1;

 // ---- top row: wordmark + anon pill ----
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

 // ---- kicker ----
 ctx.textAlign = 'left';
 ctx.fillStyle = 'rgba(255,255,255,0.9)';
 ctx.font = `700 46px ${fBody}`;
 ctx.fillText('ANSWER ME:', 80, 560);

 // ---- title: highlighted blocks, slight boho rotation ----
 const maxW = 900;
 const words = (title || 'my spill').trim().split(/\s+/);
 const wrap = (size: number) => {
 ctx.font = `900 ${size}px ${fDisp}`;
 const ls: string[] = [];
 let l = '';
 for (const w of words) {
 const t = l ? l + ' ' + w : w;
 if (ctx.measureText(t).width > maxW && l) { ls.push(l); l = w; } else { l = t; }
 }
 if (l) ls.push(l);
 return ls;
 };
 // shrink the type until the title fits its zone (max ~3 lines tall)
 let fs = 118;
 let lines = wrap(fs);
 while (lines.length * (fs + 34) > 470 && fs > 56) {
 fs -= 10;
 lines = wrap(fs);
 }

 let y = 700;
 const lh = fs + 34;
 lines.forEach((ln, i) => {
 ctx.font = `900 ${fs}px ${fDisp}`;
 const w = ctx.measureText(ln).width;
 ctx.save();
 ctx.translate(80, y);
 ctx.rotate((i % 2 ? 1 : -1) * 0.012);
 // highlight block
 ctx.fillStyle = candy[i % 4];
 ctx.beginPath(); (ctx as any).roundRect(-16, -fs + 12, w + 36, fs + 24, 18); ctx.fill();
 // dark text on block
 ctx.fillStyle = '#17123a';
 ctx.textAlign = 'left';
 ctx.fillText(ln, 4, 0);
 ctx.restore();
 y += lh;
 });

 // ---- stat ----
 ctx.textAlign = 'left';
 ctx.fillStyle = 'rgba(255,255,255,0.92)';
 ctx.font = `700 42px ${fBody}`;
 ctx.fillText(`${qCount} question${qCount === 1 ? '' : 's'} · 100% anonymous`, 84, y + 48);

 // ---- link-sticker placeholder box (label + instructions all inside,
 //      a long horizontal rectangle centred in the empty space) ----
 const statBottom = y + 90;
 const footTop = 1790;
 const bw = 920, bh = 320;
 const bx = (1080 - bw) / 2;
 const by = Math.max(statBottom + 20, statBottom + ((footTop - statBottom) - bh) / 2);

 ctx.save();
 ctx.setLineDash([22, 16]);
 ctx.lineWidth = 5;
 ctx.lineCap = 'round';
 ctx.strokeStyle = 'rgba(255,255,255,0.95)';
 ctx.fillStyle = 'rgba(255,255,255,0.14)';
 ctx.beginPath(); (ctx as any).roundRect(bx, by, bw, bh, 32); ctx.fill(); ctx.stroke();
 ctx.restore();

 ctx.textAlign = 'center';
 // label
 ctx.fillStyle = 'rgba(255,255,255,0.82)';
 ctx.font = `800 30px ${fBody}`;
 ctx.fillText('ADD YOUR “LINK” STICKER HERE', 540, by + 66);
 // big CTA
 ctx.fillStyle = '#fff';
 ctx.font = `900 54px ${fDisp}`;
 ctx.fillText('tap to spill the tea', 540, by + 136);
 // how-to inside the box
 ctx.fillStyle = 'rgba(255,255,255,0.88)';
 ctx.font = `600 30px ${fBody}`;
 ctx.fillText('1. copy your spill link   2. add a “link” sticker', 540, by + 212);
 ctx.fillText('3. drop it right here   4. post it', 540, by + 258);

 // ---- wordmark + tagline ----
 ctx.fillStyle = '#fff';
 ctx.font = `800 44px ${fDisp}`;
 ctx.fillText('spill', 540, 1850);
 ctx.fillStyle = 'rgba(255,255,255,0.7)';
 ctx.font = `600 30px ${fBody}`;
 ctx.fillText('what do they really think?', 540, 1895);

 const url = canvas.toDataURL('image/png');
 const a = document.createElement('a');
 a.href = url; a.download = 'spill-story.png';
 document.body.appendChild(a); a.click(); document.body.removeChild(a);
 };

 // ---------------- success screen ----------------
 if (isQuizCreated) {
 return (
 <Card className="mt-28 w-full max-w-2xl">
 <CardHeader className="items-center text-center">
 <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-candy-lime text-ink shadow-lg">
 <PartyPopper className="h-7 w-7" />
 </span>
 <CardTitle className="mt-4 text-3xl lowercase">{quizId?'spill updated' : 'your spill is live'}</CardTitle>
 <CardDescription>drop this link anywhere & let people spill. </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4 text-center">
 <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">share this link</p>
 <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-secondary/40 p-2">
 <Input readOnly value={quizLink} className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" />
 <Button onClick={() => copyToClipboard(quizLink,"link copied! go share it")}>
 <Share2 className="mr-2 h-4 w-4" /> copy link
 </Button>
 </div>
 <Button
 className="mx-auto mt-4 flex w-full max-w-xs items-center justify-center gap-2"
 variant="outline"
 onClick={() => downloadStory(quizTitle, questions.length)}
 >
 share to your story
 </Button>
 </CardContent>
 <CardFooter className="flex-col justify-center gap-2 sm:flex-row">
 <Button variant="outline" onClick={() => router.push('/')}>
 <Home className="mr-2 h-4 w-4" /> home
 </Button>
 <Button
 onClick={() => {
 setIsQuizCreated(false);
 setQuizId(null);
 setQuizTitle('my spill');
 setQuestions([]);
 router.push('/create');
 }}
 >
 <PlusCircle className="mr-2 h-4 w-4" /> new spill
 </Button>
 </CardFooter>
 </Card>
 );
 }

 // ---------------- editor ----------------
 return (
 <div className="mx-auto w-full max-w-4xl space-y-8 px-2 pb-24 sm:px-4">
 <div className="mt-28 flex justify-center">
 <Button variant="outline" onClick={() => router.push('/')} className="w-full max-w-xs sm:w-auto">
 <Home className="mr-2 h-4 w-4" /> back to home
 </Button>
 </div>

 <Card>
 <CardHeader>
 <span className="sticker mb-2 inline-flex w-fit bg-candy-pink text-white">make a spill </span>
 <CardTitle className="flex items-center gap-2 text-3xl lowercase">
 {quizId?"edit your spill" : "make your spill"}
 </CardTitle>
 <CardDescription>
 {quizId?"edit the title & questions people will answer." : "add a title & some questions, or steal one of our suggestions below"}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="space-y-2">
 <Label htmlFor="quiz-title" className="text-lg font-semibold">spill title</Label>
 <Input
 id="quiz-title"
 value={quizTitle}
 onChange={(e) => setQuizTitle(e.target.value)}
 placeholder="e.g. what do you REALLY think of me?"
 className="text-lg"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="end-message" className="text-lg font-semibold">end message</Label>
 <Input
 id="end-message"
 value={endMessage}
 onChange={(e) => setEndMessage(e.target.value)}
 placeholder="thanks for spilling"
 className="text-base"
 />
 <p className="text-xs text-muted-foreground">shown after someone finishes. leave blank for the default.</p>
 </div>

 <div className="space-y-4 rounded-2xl border-2 border-border bg-secondary/30 p-4">
 <h3 className="font-bold lowercase">add a question </h3>
 <Textarea
 placeholder="e.g. how good am i at texting back?"
 value={newQuestionText}
 onChange={(e) => setNewQuestionText(e.target.value)}
 />
 <Select value={newQuestionType} onValueChange={(v) => setNewQuestionType(v as any)}>
 <SelectTrigger className="w-full sm:w-[240px]">
 <SelectValue placeholder="question type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="multiple-choice">multiple choice</SelectItem>
 <SelectItem value="sliding-bar">slide-the-scale (0 to 10)</SelectItem>
 </SelectContent>
 </Select>

 {newQuestionType ==='multiple-choice' && (
 <div className="space-y-2">
 <Label className="text-sm font-semibold">options</Label>
 {options.map((option, index) => (
 <div key={index} className="flex items-center gap-2">
 <Input
 value={option}
 onChange={(e) => handleOptionChange(index, e.target.value)}
 placeholder={`option ${index + 1}`}
 />
 <Button variant="ghost" size="icon" onClick={() => removeOption(index)} disabled={options.length <= 2}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 ))}
 <Button variant="outline" size="sm" onClick={addOption}>
 <PlusCircle className="mr-2 h-4 w-4" /> add option
 </Button>
 </div>
 )}

 <Button onClick={addQuestion} className="w-full sm:w-auto">
 <PlusCircle className="mr-2 h-5 w-5" /> add question
 </Button>
 </div>
 </CardContent>
 </Card>

 <AnimatePresence>
 {questions.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -12 }}
 >
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
 {editingIndex === index? (
 <div className="space-y-3">
 <Textarea
 value={editingQuestion?.text??''}
 onChange={(e) => handleEditingQuestionChange('text', e.target.value)}
 />
 <Select
 value={editingQuestion?.type}
 onValueChange={(v) => handleEditingQuestionChange('type', v)}
 >
 <SelectTrigger className="w-full sm:w-[240px]">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="multiple-choice">multiple choice</SelectItem>
 <SelectItem value="sliding-bar">slide-the-scale (0 to 10)</SelectItem>
 </SelectContent>
 </Select>
 {editingQuestion?.type ==='multiple-choice' && (
 <div className="space-y-2">
 {editingQuestion.options?.map((opt, optIndex) => (
 <div key={optIndex} className="flex items-center gap-2">
 <Input value={opt} onChange={(e) => handleEditingOptionChange(optIndex, e.target.value)} />
 <Button
 variant="ghost"
 size="icon"
 onClick={() => removeEditingOption(optIndex)}
 disabled={(editingQuestion.options?.length?? 0) <= 2}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 ))}
 <Button variant="outline" size="sm" onClick={addEditingOption}>
 <PlusCircle className="mr-2 h-4 w-4" /> add option
 </Button>
 </div>
 )}
 <div className="flex gap-2">
 <Button size="sm" onClick={() => saveEditing(index)}>
 <Check className="mr-2 h-4 w-4" /> save
 </Button>
 <Button size="sm" variant="ghost" onClick={cancelEditing}>
 <X className="mr-2 h-4 w-4" /> cancel
 </Button>
 </div>
 </div>
 ) : (
 <>
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-start gap-3">
 {q.type ==='multiple-choice'? (
 <ListChecks className="mt-1 h-5 w-5 shrink-0 text-primary" />
 ) : (
 <SlidersHorizontal className="mt-1 h-5 w-5 shrink-0 text-primary" />
 )}
 <div>
 <p className="font-semibold">{q.text}</p>
 <Badge variant="secondary" className="mt-1">
 {q.type ==='multiple-choice'?'multiple choice' : 'slide-the-scale'}
 </Badge>
 </div>
 </div>
 <div className="flex gap-1">
 <Button variant="ghost" size="icon" onClick={() => startEditing(index)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {q.type ==='multiple-choice' && q.options && (
 <div className="mt-3 flex flex-wrap gap-2 pl-8">
 {q.options.map((opt) => (
 <Badge key={opt} variant="outline">{opt}</Badge>
 ))}
 </div>
 )}

 {q.type ==='sliding-bar' && (
 <div className="mt-4 flex items-center gap-2 pl-8">
 <span className="text-sm text-muted-foreground">0</span>
 <div className="h-1 w-full rounded-full bg-muted" />
 <span className="text-sm text-muted-foreground">10</span>
 </div>
 )}
 </>
 )}
 </motion.div>
 ))}
 </CardContent>
 <CardFooter className="flex-col gap-2 sm:flex-row">
 <Button onClick={createAndShareQuiz} size="lg" disabled={questions.length === 0}>
 <Share2 className="mr-2 h-5 w-5" />
 {quizId?'update & get link' : 'make my spill'}
 </Button>
 <Button onClick={saveQuiz} size="lg" variant="secondary" disabled={questions.length === 0}>
 <Save className="mr-2 h-5 w-5" />
 {quizId?'update spill' : 'save spill'}
 </Button>
 </CardFooter>
 </Card>
 </motion.div>
 )}
 </AnimatePresence>

 <Card>
 <CardHeader>
 <h3 className="flex items-center gap-2 text-lg font-bold lowercase">
 <Wand2 className="text-primary" /> not sure what to ask?
 </h3>
 <CardDescription>steal one of these to get started </CardDescription>
 </CardHeader>
 <CardContent className="flex flex-wrap gap-2">
 {suggestedQuestions.map((q) => (
 <Button key={q.id} variant="outline" size="sm" onClick={() => addSuggestedQuestion(q)}>
 <PlusCircle className="mr-2 h-4 w-4" /> {q.text}
 </Button>
 ))}
 </CardContent>
 </Card>
 </div>
 );
}

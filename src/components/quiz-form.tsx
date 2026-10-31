
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ListChecks, SlidersHorizontal, ShieldCheck, UserCheck } from 'lucide-react';
import { useQuiz } from '@/hooks/use-quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MultipleChoiceQuestion } from '@/components/multiple-choice-question';
import { SlidingBarQuestion } from '@/components/sliding-bar-question';
import { Skeleton } from './ui/skeleton';
import { type Question, type Quiz } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function QuizForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [quiz, setQuiz] = useState<Quiz | null>(null);
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 const { answers, setAnswer, isLoaded: answersLoaded } = useQuiz();
 const [isQuizLoaded, setIsQuizLoaded] = useState(false);
 const [isAnonymous, setIsAnonymous] = useState(true);
 const [respondentName, setRespondentName] = useState('');

 useEffect(() => {
 const quizId = searchParams.get('id');
 if (quizId) {
 const fetchQuiz = async () => {
 try {
 const quizDoc = await getDoc(doc(db,"quizzes", quizId));
 if (quizDoc.exists()) {
 const qData = { id: quizDoc.id,...quizDoc.data() } as Quiz;
 setQuiz(qData);
 if (qData.anonymityMode === 'always_named') {
 setIsAnonymous(false);
 } else {
 setIsAnonymous(true);
 }
 } else {
 console.error("Quiz not found");
 router.push('/');
 }
 } catch (error) {
 console.error("Failed to fetch quiz data: ", error);
 router.push('/');
 }
 }
 fetchQuiz();
 } else {
 router.push('/');
 }
 }, [searchParams, router]);

 useEffect(() => {
 if (answersLoaded && quiz) {
 setIsQuizLoaded(true);
 }
 }, [answersLoaded, quiz]);

 const handleNext = () => {
 if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
 setCurrentQuestionIndex(currentQuestionIndex + 1);
 } else {
 const quizId = searchParams.get('id');
 router.push(`/results?quizId=${quizId}`);
 }
 };

 const handlePrev = () => {
 if (currentQuestionIndex > 0) {
 setCurrentQuestionIndex(currentQuestionIndex - 1);
 }
 };

 if (!isQuizLoaded ||!quiz) {
 return (
 <Card className="w-full max-w-2xl">
 <CardHeader>
 <Skeleton className="h-4 w-1/4" />
 <Skeleton className="mt-2 h-4 w-full" />
 </CardHeader>
 <CardContent>
 <Skeleton className="h-40 w-full" />
 </CardContent>
 <CardFooter className="flex justify-between">
 <Skeleton className="h-10 w-24" />
 <Skeleton className="h-10 w-24" />
 </CardFooter>
 </Card>
 );
 }

 const currentQuestion = quiz.questions[currentQuestionIndex];
 const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
 const effectiveAnon = quiz.anonymityMode === 'always_anon' ? true : quiz.anonymityMode === 'always_named' ? false : isAnonymous;
 const Icon =
 currentQuestion.type ==='multiple-choice'
? ListChecks
 : SlidersHorizontal;

 return (
 <Card className="w-full max-w-2xl overflow-hidden">
 <CardHeader className="ngl-grad text-white">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
 {quiz.title}
 </span>
 <span className="font-mono text-xs font-bold text-white/90">
 {String(currentQuestionIndex + 1).padStart(2,'0')} / {String(quiz.questions.length).padStart(2,'0')}
 </span>
 </div>
 <div className="mb-6">
 <Progress value={progress} className="h-1.5 bg-black/25" />
 </div>
 <div className="flex items-start gap-3">
 <Icon className="mt-2 h-6 w-6 shrink-0 text-white" />
 <h2 className="display text-3xl font-black lowercase leading-tight text-white">{currentQuestion.text}</h2>
 </div>
 </CardHeader>
 <CardContent className="min-h-[200px]">
 <AnimatePresence mode="wait">
 <motion.div
 key={currentQuestionIndex}
 initial={{ opacity: 0, x: 50 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -50 }}
 transition={{ duration: 0.3 }}
 >
 {currentQuestion.type ==='multiple-choice'? (
 <MultipleChoiceQuestion
 question={currentQuestion}
 value={answers[currentQuestion.id]}
 onAnswerChange={(value) =>
 setAnswer(currentQuestion.id, value)
 }
 />
 ) : (
 <SlidingBarQuestion
 question={currentQuestion}
 value={answers[currentQuestion.id]}
 onAnswerChange={(value) =>
 setAnswer(currentQuestion.id, value)
 }
 />
 )}
 </motion.div>
 </AnimatePresence>
 </CardContent>
 {/* Anonymity bar */}
 <div className="mx-6 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 p-3">
 <div className="flex items-center gap-2.5">
 {effectiveAnon ? (
 <ShieldCheck className="h-4 w-4 text-candy-lime shrink-0" />
 ) : (
 <UserCheck className="h-4 w-4 text-candy-blue shrink-0" />
 )}
 <div className="text-left">
 <span className="block text-xs font-bold">
 {effectiveAnon ? '100% anonymous' : `signed as ${respondentName.trim() || 'friend'}`}
 </span>
 <span className="block text-[11px] text-muted-foreground">
 {effectiveAnon ? 'the creator will not see who answered' : 'your name will appear on results'}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 {!effectiveAnon && (
 <Input
 placeholder="your name..."
 value={respondentName}
 onChange={(e) => setRespondentName(e.target.value)}
 className="h-8 text-xs w-full sm:w-36 rounded-xl"
 />
 )}
 {quiz.anonymityMode === 'always_anon' ? (
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
 host locked
 </span>
 ) : quiz.anonymityMode === 'always_named' ? (
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
 names required
 </span>
 ) : (
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => setIsAnonymous(!isAnonymous)}
 className="h-8 text-xs font-bold rounded-xl shrink-0"
 >
 {effectiveAnon ? 'sign your name' : 'stay anonymous'}
 </Button>
 )}
 </div>
 </div>

 <CardFooter className="flex justify-between border-t px-6 py-4">
 <Button
 variant="outline"
 onClick={handlePrev}
 disabled={currentQuestionIndex === 0}
 >
 <ArrowLeft className="mr-2 h-4 w-4" />
 Prev
 </Button>
 <Button
 onClick={handleNext}
 disabled={answers[currentQuestion.id] === undefined}
 >
 {currentQuestionIndex === quiz.questions.length - 1?'spill it' : 'next'}
 <ArrowRight className="ml-2 h-4 w-4" />
 </Button>
 </CardFooter>
 </Card>
 );
}

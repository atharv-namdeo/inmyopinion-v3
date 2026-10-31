
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuiz } from '@/hooks/use-quiz';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, PlusCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


export function ResultsDisplay() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { answers, clearAnswers, isLoaded: answersLoaded } = useQuiz();
 const { toast } = useToast();

 useEffect(() => {
 const quizId = searchParams.get('quizId');
 if (!quizId) {
 // If no quizId, redirect to home
 router.replace('/');
 return;
 }
 if (answersLoaded && Object.keys(answers).length > 0) {
 const saveAnswers = async () => {
 try {
 const isAnon = typeof window !== 'undefined' ? localStorage.getItem('spill_is_anon') !== 'false' : true;
 const respName = typeof window !== 'undefined' ? (localStorage.getItem('spill_respondent_name') || '') : '';
 await addDoc(collection(db,"responses"), {
 quizId,
 answers,
 isAnonymous: isAnon,
 respondentName: isAnon ? '' : respName.trim(),
 createdAt: new Date().toISOString(),
 });
 if (typeof window !== 'undefined') {
 localStorage.removeItem('spill_is_anon');
 localStorage.removeItem('spill_respondent_name');
 }
 clearAnswers();
 } catch (error) {
 console.error("Error saving responses: ", error);
 toast({
 variant: "destructive",
 title: "Submission Failed",
 description: "There was an error submitting your answers."
 })
 }
 }
 saveAnswers();
 }
 // Do NOT redirect if answers are empty after submission
 }, [searchParams, router, answers, answersLoaded, clearAnswers, toast]);

 const handleCreateOwnQuiz = () => {
 clearAnswers();
 router.push('/create');
 };

 return (
 <Card className="w-full max-w-xl overflow-hidden text-center">
 {/* gradient banner */}
 <CardHeader className="ngl-grad relative items-center overflow-hidden pb-10 pt-12 text-center text-white">
 <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">
 <Coffee className="h-7 w-7" />
 </div>
 <span className="relative text-xs font-bold uppercase tracking-[0.3em] text-white/80">
 tea spilled
 </span>
 <CardTitle className="relative mt-3 text-4xl lowercase text-white">you spilled the tea</CardTitle>
 <CardDescription className="relative mt-2 max-w-sm font-semibold text-white/85">
 thanks for spilling! your answers have been added to the tea.
 </CardDescription>
 </CardHeader>
 <CardContent className="flex min-h-[80px] items-center justify-center pt-6">
 <p className="font-heading text-lg font-bold lowercase text-muted-foreground">
 spill the tea
 </p>
 </CardContent>
 <CardFooter className="flex-col items-center gap-4 px-6 pb-10">
 <Button onClick={handleCreateOwnQuiz} size="lg" className="w-full max-w-xs uppercase tracking-wide">
 <PlusCircle className="mr-2 h-4 w-4" />
 make your own spill
 </Button>
 </CardFooter>
 </Card>
 );
}

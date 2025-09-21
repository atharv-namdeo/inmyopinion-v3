
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuiz } from '@/hooks/use-quiz';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle } from 'lucide-react';
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
          await addDoc(collection(db, "responses"), {
            quizId,
            answers,
            createdAt: new Date().toISOString(),
          });
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
    <Card className="w-full max-w-2xl shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <div className="mt-6" />
  <CardTitle className="text-3xl font-headline mt-8">IMO Results</CardTitle>
        <CardDescription>
          Your responses have been recorded.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px] flex items-center justify-center">
         <p className="text-muted-foreground">Thank you for your feedback!</p>
      </CardContent>
      <CardFooter className="flex-col items-center gap-4 border-t px-6 py-4">
        <Button onClick={handleCreateOwnQuiz} size="lg" className="w-full max-w-xs">
          <PlusCircle className="mr-2 h-4 w-4" />
          Make Your Own IMO
        </Button>
      </CardFooter>
    </Card>
  );
}

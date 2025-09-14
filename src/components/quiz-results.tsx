
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { type Quiz, type QuizResponse, type Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MultipleChoiceResult } from './multiple-choice-result';
import { SlidingBarResult } from './sliding-bar-result';

type Props = {
  quizId: string;
};

export function QuizResults({ quizId }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizAndResponses = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      // Fetch quiz data
      const quizDoc = await getDoc(doc(db, "quizzes", quizId));
      if (!quizDoc.exists() || quizDoc.data().userId !== user.uid) {
        console.error("Quiz not found or unauthorized");
        router.push('/');
        return;
      }
      const quizData = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
      setQuiz(quizData);

      // Fetch responses
      const responsesQuery = query(collection(db, 'responses'), where('quizId', '==', quizId));
      const responsesSnapshot = await getDocs(responsesQuery);
      const responsesData = responsesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResponse));
      setResponses(responsesData);

    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setLoading(false);
    }
  }, [quizId, user, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchQuizAndResponses();
    }
  }, [authLoading, fetchQuizAndResponses]);


  if (loading || authLoading) {
    return (
       <div className="w-full max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!quiz) {
     return (
       <div className="w-full max-w-4xl mx-auto text-center">
         <p>Quiz not found or you do not have permission to view these results.</p>
          <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
       </div>
     );
  }

  const getAnswersForQuestion = (questionId: string) => {
    return responses.map(r => r.answers[questionId]).filter(answer => answer !== undefined);
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-primary" />
            Quiz Results
        </h1>
        <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>{responses.length} response(s) so far</CardDescription>
        </CardHeader>
      </Card>
      {responses.length === 0 ? (
        <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
                <p>No responses yet. Share your quiz to get feedback!</p>
            </CardContent>
        </Card>
      ) : (
        quiz.questions.map((question, index) => (
             <Card key={question.id}>
                <CardHeader>
                    <CardTitle className="text-xl">Question {index + 1}: <span className="font-normal">{question.text}</span></CardTitle>
                </CardHeader>
                <CardContent>
                    {question.type === 'multiple-choice' && question.options ? (
                        <MultipleChoiceResult question={question} answers={getAnswersForQuestion(question.id)} />
                    ) : (
                       <SlidingBarResult question={question} answers={getAnswersForQuestion(question.id)} />
                    )}
                </CardContent>
             </Card>
        ))
      )}

    </div>
  );
}

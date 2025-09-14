
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { type Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, Eye, BarChart2, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export function UserQuizzesList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchQuizzes = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'quizzes'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const userQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
      setQuizzes(userQuizzes);
    } catch (error: any) {
      console.error("Error fetching quizzes:", error);
      toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch your quizzes. Please try again later."
      })
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
        fetchQuizzes(user.uid);
    } else if (!authLoading) {
        // User is not logged in and auth is not loading
        setQuizzes([]);
        setLoading(false);
    }
  }, [user, authLoading, fetchQuizzes]);


  const getQuizLink = (quizId: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/quiz?id=${quizId}`;
  }

  const copyToClipboard = (text: string) => {
     if (typeof window === 'undefined') return;
     navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "The quiz link has been copied to your clipboard.",
      });
    }, () => {
       toast({
        variant: "destructive",
        title: "Failed to Copy",
        description: "Could not copy the link. Please copy it manually.",
      });
    });
  }
  
  if (authLoading) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Your Quizzes</CardTitle>
                <CardDescription>
                  Loading your quizzes...
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[75px] w-full rounded-lg" />
                <Skeleton className="h-[75px] w-full rounded-lg" />
              </div>
            </CardContent>
        </Card>
    )
  }

  if (!user) {
    return (
        <Card>
           <CardHeader>
               <CardTitle>Your Quizzes</CardTitle>
               <CardDescription>
                 Please log in to view your quizzes.
               </CardDescription>
           </CardHeader>
           <CardContent className="text-center p-8 border-2 border-dashed rounded-lg">
               <p className="mb-4">You need to be logged in to see your created quizzes.</p>
               <Button asChild>
                   <Link href="/login">Login</Link>
               </Button>
           </CardContent>
       </Card>
   );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Quizzes</CardTitle>
        <CardDescription>
          Quizzes you've created will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex flex-col space-y-3">
                <Skeleton className="h-[75px] w-full rounded-lg" />
                <Skeleton className="h-[75px] w-full rounded-lg" />
            </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <FileQuestion className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Quizzes Yet</h3>
            <p className="mt-2">
              Click on the "Create New Quiz" tab to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className='flex-1'>
                  <h4 className="font-semibold text-lg">{quiz.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(quiz.createdAt.toDate(), { addSuffix: true })} &middot; {quiz.questions.length} questions
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button asChild variant="outline" size="sm" className='w-full sm:w-auto justify-center'>
                    <Link href={`/create?quizId=${quiz.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                   <Button variant="outline" size="sm" onClick={() => copyToClipboard(getQuizLink(quiz.id))} className='w-full sm:w-auto justify-center'>
                      <Share2 className="mr-2 h-4 w-4" /> Copy Link
                    </Button>
                  <Button asChild variant="secondary" size="sm" className='w-full sm:w-auto justify-center'>
                    <Link href={`/results/${quiz.id}`}>
                      <BarChart2 className="mr-2 h-4 w-4" /> Results
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


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
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';

export function UserQuizzesList() {
 const [quizzes, setQuizzes] = useState<Quiz[]>([]);
 const [loading, setLoading] = useState(true);
 const { user, loading: authLoading } = useAuth();
 const { toast } = useToast();

 const handleDeleteQuiz = async (quizId: string) => {
 if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
 try {
 await deleteDoc(doc(db,'quizzes', quizId));
 setQuizzes((prev: Quiz[]) => prev.filter((quiz: Quiz) => quiz.id !== quizId));
 toast({
 title: 'Quiz Deleted',
 description: 'Your quiz has been deleted successfully.'
 });
 } catch (error: any) {
 console.error('Error deleting quiz: ', error);
 toast({
 variant: 'destructive',
 title: 'Delete Failed',
 description: 'Could not delete the quiz. Please try again.'
 });
 }
 };

 const fetchQuizzes = useCallback(async (uid: string) => {
 setLoading(true);
 try {
 const q = query(collection(db,'quizzes'), where('userId','==', uid), orderBy('createdAt','desc'));
 const querySnapshot = await getDocs(q);
 const userQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id,...doc.data() } as Quiz));
 setQuizzes(userQuizzes);
 } catch (error: any) {
 console.error("Error fetching quizzes: ", error);
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
 if (typeof window ==='undefined') return'';
 return `${window.location.origin}/quiz?id=${quizId}`;
 }

 const copyToClipboard = (text: string) => {
 if (typeof window ==='undefined') return;
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
 <CardTitle>your spills</CardTitle>
 <CardDescription>
 loading your spills…
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
 <CardTitle>your spills</CardTitle>
 <CardDescription>
 log in to see your spills.
 </CardDescription>
 </CardHeader>
 <CardContent className="m-6 mt-0 rounded-xl border border-dashed border-border p-8 text-center">
 <p className="mb-4 text-muted-foreground">you gotta be logged in to see your spills.</p>
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
 <CardTitle>your spills</CardTitle>
 <CardDescription>
 every spill you&apos;ve made, all in one place.
 </CardDescription>
 </CardHeader>
 <CardContent>
 {loading? (
 <div className="flex flex-col space-y-3">
 <Skeleton className="h-[75px] w-full rounded-lg" />
 <Skeleton className="h-[75px] w-full rounded-lg" />
 </div>
 ) : quizzes.length === 0? (
 <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
 <FileQuestion className="mx-auto h-12 w-12 text-primary/70" />
 <h3 className="h-display mt-4 text-xl font-black lowercase text-foreground">no spills yet</h3>
 <p className="mt-2 text-sm">
 hit the <span className="text-primary">new spill</span> tab to make your first one.
 </p>
 </div>
 ) : (
 <ul className="space-y-3">
 {quizzes.map((quiz) => (
 <li key={quiz.id} className="group flex flex-col justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-4 transition-colors duration-300 hover:border-primary/40 hover:bg-secondary/40 sm:flex-row sm:items-center">
 <div className='flex-1'>
 <h4 className="display text-lg font-semibold">{quiz.title}</h4>
 <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
 {formatDistanceToNow(quiz.createdAt.toDate(), { addSuffix: true })} &middot; {quiz.questions.length} questions
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
 <Button variant="destructive" size="sm" onClick={() => handleDeleteQuiz(quiz.id)} className='w-full sm:w-auto justify-center'>
 Delete
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


"use client";

import Link from 'next/link';
import { Bot, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserQuizzesList } from '@/components/user-quizzes-list';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCreateQuizClick = () => {
    if (user) {
      router.push('/create');
    } else {
      router.push('/login');
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Tabs defaultValue="create" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Quiz</TabsTrigger>
          <TabsTrigger value="quizzes">Your Quizzes</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Card className="w-full shadow-2xl">
            <CardHeader className="items-center text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-3xl font-headline">
                Welcome to Feedback Flow
              </CardTitle>
              <CardDescription className="mt-2 text-lg">
                Create your own quiz to get personalized, AI-powered feedback from your friends.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="mb-6 text-center text-muted-foreground">
                Your journey to self-improvement starts here. Let's begin!
              </p>
              <Button onClick={handleCreateQuizClick} className="w-full max-w-xs" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create a New Quiz
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quizzes">
            <UserQuizzesList />
        </TabsContent>
      </Tabs>
    </main>
  );
}

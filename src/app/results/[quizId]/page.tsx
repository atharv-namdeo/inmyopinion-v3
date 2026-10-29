import { QuizResults } from '@/components/quiz-results';
import { Suspense } from 'react';

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  return (
    <main className="container mx-auto min-h-screen p-4">
      <Suspense fallback={<div>Loading results...</div>}>
        <QuizResults quizId={quizId} />
      </Suspense>
    </main>
  );
}

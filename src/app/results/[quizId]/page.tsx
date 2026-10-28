import { QuizResults } from '@/components/quiz-results';
import { Suspense, use } from 'react';

export default function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  return (
    <main className="container mx-auto min-h-screen p-4">
      <Suspense fallback={<div>Loading results...</div>}>
        <QuizResults quizId={quizId} />
      </Suspense>
    </main>
  );
}

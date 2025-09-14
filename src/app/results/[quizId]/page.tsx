
import { QuizResults } from '@/components/quiz-results';
import { Suspense } from 'react';

export default function QuizResultsPage({ params }: { params: { quizId: string } }) {
  return (
    <main className="container mx-auto min-h-screen p-4">
      <Suspense fallback={<div>Loading results...</div>}>
        <QuizResults quizId={params.quizId} />
      </Suspense>
    </main>
  );
}

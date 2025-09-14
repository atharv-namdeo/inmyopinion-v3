import { ResultsDisplay } from '@/components/results-display';
import { Suspense } from 'react';

export default function ResultsPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense>
        <ResultsDisplay />
      </Suspense>
    </main>
  );
}

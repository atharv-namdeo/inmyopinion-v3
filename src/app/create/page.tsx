import { CreateQuizForm } from '@/components/create-quiz-form';
import { Suspense } from 'react';

function CreateQuizPageContent() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
      <CreateQuizForm />
    </main>
  );
}


export default function CreateQuizPage() {
  return (
    <Suspense>
      <CreateQuizPageContent />
    </Suspense>
  )
}

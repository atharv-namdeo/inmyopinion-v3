import { GroupResults } from '@/components/group/group-results';
import { Suspense } from 'react';

export default function GroupResultsPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
      <Suspense fallback={<div>loading results…</div>}>
        <GroupResults />
      </Suspense>
    </main>
  );
}

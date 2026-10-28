import { GroupVote } from '@/components/group/group-vote';
import { Suspense } from 'react';

export default function GroupVotePage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense>
        <GroupVote />
      </Suspense>
    </main>
  );
}

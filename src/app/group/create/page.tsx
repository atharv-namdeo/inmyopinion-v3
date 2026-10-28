import { CreateGroupForm } from '@/components/group/create-group-form';
import { Suspense } from 'react';

function CreateGroupPageContent() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
      <CreateGroupForm />
    </main>
  );
}

export default function CreateGroupPage() {
  return (
    <Suspense>
      <CreateGroupPageContent />
    </Suspense>
  );
}

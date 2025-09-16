
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientAuthProvider } from '@/hooks/use-auth';
import { ProfileButton } from '@/components/profile-button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'InMyOpinion',
  description: 'Get personalized feedback on your responses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ClientAuthProvider>
          <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
            <img src="https://imgpx.com/ji4137b3djuh.png" alt="Logo" className="h-10 w-10 rounded-full border border-primary" />
            <span className="text-xl font-bold text-primary">InMyOpinion</span>
          </div>
          <div className="absolute top-4 right-4 z-50">
            <Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
              <ProfileButton />
            </Suspense>
          </div>
          {children}
          <Toaster />
        </ClientAuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Unbounded, Bricolage_Grotesque, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientAuthProvider } from '@/hooks/use-auth';
import { ProfileButton } from '@/components/profile-button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Analytics } from '@vercel/analytics/react';
import { Wordmark } from '@/components/brand/wordmark';
import { Cursor } from '@/components/fx/cursor';
import { PageTransition } from '@/components/motion/page-transition';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavLinks } from '@/components/nav-links';

// Runs before paint to set the theme class and avoid a flash of the wrong theme.
const themeBoot = `(function(){try{var t=localStorage.getItem('verdikt-theme');if(!t){t='dark';}var r=document.documentElement;if(t ==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}r.setAttribute('data-theme',t);}catch(e){}})();`;

// Playful rounded display for the wordmark + giant hero type
const unbounded = Unbounded({
 subsets: ['latin'],
 weight: ['400','500','700','800','900'],
 variable: '--font-display',
 display: 'swap',
});

// Chunky friendly grotesque for section headings
const bricolage = Bricolage_Grotesque({
 subsets: ['latin'],
 weight: ['400','500','600','700','800'],
 variable: '--font-heading',
 display: 'swap',
});

const grotesk = Space_Grotesk({
 subsets: ['latin'],
 weight: ['400','500','600','700'],
 variable: '--font-grotesk',
 display: 'swap',
});

const mono = JetBrains_Mono({
 subsets: ['latin'],
 weight: ['400','500'],
 variable: '--font-mono',
 display: 'swap',
});

export const metadata: Metadata = {
 title: 'spill — what do they really think?',
 description:
'Make a lil poll about yourself, drop the link, and let people spill the tea anonymously — then AI reads the room and tells you the vibe.',
 metadataBase: new URL('https://spill.app'),
 openGraph: {
 title: 'spill — what do they really think?',
 description:
'Drop the link, let them spill the tea anonymously.',
 type: 'website',
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 className={`${unbounded.variable} ${bricolage.variable} ${grotesk.variable} ${mono.variable}`}
 suppressHydrationWarning
 >
 <head>
 <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
 </head>
 <body className="grain vignette relative min-h-screen font-body antialiased">
 <div className="canvas-bg" aria-hidden />
 <Cursor />
 <ClientAuthProvider>
 {/* top navigation */}
 <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-5">
 <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-full border border-white/15 bg-black/25 px-4 py-2.5 shadow-lg backdrop-blur-2xl md:px-5 md:py-3">
 <Wordmark />
 <NavLinks />
 <div className="flex items-center gap-2.5">
 <ThemeToggle />
 <Suspense
 fallback={<Skeleton className="h-11 w-24 rounded-full" />}
 >
 <ProfileButton />
 </Suspense>
 </div>
 </div>
 </header>

 <PageTransition>{children}</PageTransition>
 <Toaster />
 </ClientAuthProvider>
 <Analytics />
 </body>
 </html>
 );
}

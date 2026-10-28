"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SplitText } from '@/components/motion/split-text';
import { Reveal } from '@/components/motion/reveal';
import { Marquee } from '@/components/fx/marquee';
import { Floaters } from '@/components/ngl/floaters';
import { Hand, Heart, Coffee } from 'lucide-react';
import { loginErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const { login } = useAuth();
 const router = useRouter();
 const { toast } = useToast();
 const [loading, setLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 try {
 await login(username, password);
 toast({ title: 'welcome back', description: "let's get into it." });
 router.push('/');
 } catch (error: any) {
 toast({
 variant: 'destructive',
 title: 'Access denied',
 description: loginErrorMessage(error),
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <main className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
 {/* editorial side */}
 <section className="ngl-grad relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
 <Floaters
 items={[
 { Icon: Hand, className: 'left-[12%] top-[18%]', rotate: -12 },
 { Icon: Heart, className: 'right-[14%] top-[30%]', rotate: 10 },
 { Icon: Coffee, className: 'left-[16%] bottom-[18%]', size: 26, rotate: 8 },
 ]}
 />
 <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
 hey bestie
 </span>
 <div className="relative z-10">
 <h1 className="display text-fluid-xl font-black lowercase leading-[0.9] text-white">
 <SplitText by="word">welcome</SplitText>
 <br />
 <SplitText by="word" delay={0.2}>back</SplitText>
 </h1>
 <p className="mt-6 max-w-sm text-base font-semibold leading-relaxed text-white/85">
 your spills, your tea, your AI reads — all waiting right where you
 left them.
 </p>
 </div>
 <Marquee
 className="relative z-10 font-heading text-xl font-black lowercase text-white/80"
 separator=""
 items={['spill the tea','no cap','no filter']}
 />
 </section>

 {/* form side */}
 <section className="flex items-center justify-center px-5 py-24">
 <Reveal className="w-full max-w-sm">
 <span className="sticker inline-flex bg-candy-lime text-ink">welcome back </span>
 <h2 className="h-display mt-4 text-4xl font-black lowercase">log in</h2>
 <p className="mt-2 text-sm font-medium text-muted-foreground">
 log in to make spills & read the tea.
 </p>

 <form onSubmit={handleLogin} className="mt-8 space-y-5">
 <div className="space-y-2">
 <Label htmlFor="username" className="uppercase tracking-wide text-xs">
 Username
 </Label>
 <Input
 id="username"
 type="text"
 placeholder="yourusername"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 required
 className="h-12 rounded-xl"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="password" className="uppercase tracking-wide text-xs">
 Password
 </Label>
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="h-12 rounded-xl"
 />
 </div>
 <Button
 type="submit"
 size="lg"
 className="w-full uppercase tracking-wide"
 disabled={loading}
 >
 {loading?'opening…' : "let's go"}
 {!loading && <ArrowRight className="h-5 w-5" />}
 </Button>
 </form>

 <p className="mt-6 text-center text-sm text-muted-foreground">
 No account yet?{' '}
 <Link
 href="/register"
 className="font-semibold text-primary underline-offset-4 hover:underline"
 >
 Register
 </Link>
 </p>
 </Reveal>
 </section>
 </main>
 );
}

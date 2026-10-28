"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SplitText } from '@/components/motion/split-text';
import { Reveal } from '@/components/motion/reveal';
import { Marquee } from '@/components/fx/marquee';
import { Floaters } from '@/components/ngl/floaters';
import { Eye, Coffee, Flame } from 'lucide-react';
import { registerErrorMessage } from '@/lib/auth-errors';

export default function RegisterPage() {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [gender, setGender] = useState('');
 const { register } = useAuth();
 const router = useRouter();
 const { toast } = useToast();
 const [loading, setLoading] = useState(false);

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 if (password.length < 6) {
 toast({
 variant: 'destructive',
 title: 'Registration failed',
 description: 'Password must be at least 6 characters long.',
 });
 return;
 }
 if (!gender) {
 toast({
 variant: 'destructive',
 title: 'Registration failed',
 description: 'Please select a gender.',
 });
 return;
 }
 setLoading(true);
 try {
 await register(username, password, gender as any);
 toast({
 title: "you're in",
 description: 'account made. now go spill.',
 });
 router.push('/');
 } catch (error: any) {
 toast({
 variant: 'destructive',
 title: 'Registration failed',
 description: registerErrorMessage(error),
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <main className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
 {/* editorial side */}
 <section className="ngl-grad-alt relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
 <Floaters
 items={[
 { Icon: Eye, className: 'left-[12%] top-[20%]', rotate: -10 },
 { Icon: Coffee, className: 'right-[14%] top-[32%]', rotate: 12 },
 { Icon: Flame, className: 'left-[16%] bottom-[18%]', size: 26, rotate: -8 },
 ]}
 />
 <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
 new here
 </span>
 <div className="relative z-10">
 <h1 className="display text-fluid-xl font-black lowercase leading-[0.9] text-white">
 <SplitText by="word">ready for</SplitText>
 <br />
 <SplitText by="word" delay={0.2}>the tea?</SplitText>
 </h1>
 <p className="mt-6 max-w-sm text-base font-semibold leading-relaxed text-white/85">
 make an account, drop your first spill, and find out what people
 actually think when it&apos;s 100% anon.
 </p>
 </div>
 <Marquee
 className="relative z-10 font-heading text-xl font-black lowercase text-white/80"
 separator=""
 items={['no cap','anonymous','spill the tea']}
 />
 </section>

 {/* form side */}
 <section className="flex items-center justify-center px-5 py-24">
 <Reveal className="w-full max-w-sm">
 <span className="sticker inline-flex bg-candy-blue text-white">new here </span>
 <h2 className="h-display mt-4 text-4xl font-black lowercase">sign up</h2>
 <p className="mt-2 text-sm font-medium text-muted-foreground">
 make an account & start collecting tea.
 </p>

 <form onSubmit={handleRegister} className="mt-8 space-y-5">
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
 <div className="space-y-2">
 <Label htmlFor="gender" className="uppercase tracking-wide text-xs">
 Gender
 </Label>
 <Select value={gender} onValueChange={setGender}>
 <SelectTrigger id="gender" className="h-12 rounded-xl">
 <SelectValue placeholder="Select gender" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="male">Male</SelectItem>
 <SelectItem value="female">Female</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 <SelectItem value="prefer-not-to-say">
 Prefer not to say
 </SelectItem>
 </SelectContent>
 </Select>
 </div>
 <Button
 type="submit"
 size="lg"
 className="w-full uppercase tracking-wide"
 disabled={loading}
 >
 {loading?'creating…' : 'make my account'}
 {!loading && <ArrowRight className="h-5 w-5" />}
 </Button>
 </form>

 <p className="mt-6 text-center text-sm text-muted-foreground">
 Already have an account?{' '}
 <Link
 href="/login"
 className="font-semibold text-primary underline-offset-4 hover:underline"
 >
 Login
 </Link>
 </p>
 </Reveal>
 </section>
 </main>
 );
}

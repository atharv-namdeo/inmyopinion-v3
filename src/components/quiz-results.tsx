
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { type Quiz, type QuizResponse, type Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MultipleChoiceResult } from './multiple-choice-result';
import { SlidingBarResult } from './sliding-bar-result';
import html2canvas from 'html2canvas';
import { StoryCaptureWrapper } from './story-capture-wrapper';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Props = {
  quizId: string;
};

export function QuizResults({ quizId }: Props) {
  // Always call hooks at the top, before any early returns
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizAndResponses = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      // Fetch quiz data
      const quizDoc = await getDoc(doc(db, "quizzes", quizId));
      if (!quizDoc.exists() || quizDoc.data().userId !== user.uid) {
        console.error("Quiz not found or unauthorized");
        router.push('/');
        return;
      }
      const quizData = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
      setQuiz(quizData);

      // Fetch responses
      const responsesQuery = query(collection(db, 'responses'), where('quizId', '==', quizId));
      const responsesSnapshot = await getDocs(responsesQuery);
      const responsesData = responsesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResponse));
      setResponses(responsesData);

    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setLoading(false);
    }
  }, [quizId, user, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchQuizAndResponses();
    }
  }, [authLoading, fetchQuizAndResponses]);


  if (loading || authLoading) {
    return (
       <div className="w-full max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!quiz) {
     return (
       <div className="w-full max-w-4xl mx-auto text-center">
         <p>Quiz not found or you do not have permission to view these results.</p>
          <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
       </div>
     );
  }


  const getAnswersForQuestion = (questionId: string) => {
    return responses.map(r => r.answers[questionId]).filter(answer => answer !== undefined);
  };

  // Refs for each question's story preview

  // Handler for sharing story: capture and download image
  const handleShareStory = async (question: Question, index: number) => {
    const ref = storyRefs.current[index];
    if (!ref) return;
    // Use scale: 1 for 1080x1920, or higher for retina
    const canvas = await html2canvas(ref, { backgroundColor: '#18181b', scale: 1, width: 1080, height: 1920 });
    const url = canvas.toDataURL('image/png');
    // For mobile Safari, use a workaround for download
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Open image in new tab for manual save
      window.open(url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = `story-question-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Add extra space before IMO Results card */}
      <div className="h-16" />
      <Card className="mb-2">
        <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">IMO Results</span>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
            style={{ minWidth: 160 }}
          >
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </CardHeader>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>{responses.length} response(s) so far</CardDescription>
        </CardHeader>
      </Card>
      {responses.length === 0 ? (
        <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
                <p>No responses yet. Share your quiz to get feedback!</p>
            </CardContent>
        </Card>
      ) : (
    quiz.questions.map((question, index) => (
      <div key={question.id}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Question {index + 1}: <span className="font-normal">{question.text}</span></CardTitle>
          </CardHeader>
          <CardContent>
            {question.type === 'multiple-choice' && question.options ? (
              <MultipleChoiceResult question={question} answers={getAnswersForQuestion(question.id)} />
            ) : (
              <SlidingBarResult question={question} answers={getAnswersForQuestion(question.id)} />
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => handleShareStory(question, index)}>
                Share as Story
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Hidden story preview for image capture */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: 1080, height: 1920 }}>
          <StoryCaptureWrapper ref={el => { storyRefs.current[index] = el; }}>
            <div style={{
              width: '100%',
              maxWidth: 900,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minHeight: 1600,
              position: 'relative',
              paddingTop: 10, // further reduced from 40 to 10
            }}>
              {/* Logo */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <img src="/logo.png" alt="Logo" style={{ width: 200, height: 200, borderRadius: 48, boxShadow: '0 6px 32px #0006' }} />
              </div>
              {/* Quiz name */}
              <div style={{ color: '#fff', fontSize: 90, fontWeight: 800, marginBottom: 16, textAlign: 'center', textShadow: '0 4px 16px #000' }}>{quiz.title}</div>
              {/* Question */}
              <div style={{ color: '#fff', fontSize: 48, fontWeight: 600, marginBottom: 48, textAlign: 'center', textShadow: '0 2px 8px #000' }}>{question.text}</div>
              {/* Pie Chart for multiple-choice */}
              {question.type === 'multiple-choice' && question.options && getAnswersForQuestion(question.id).length > 0 && (
                <div style={{ width: 520, height: 520, margin: '0 auto 48px auto', background: 'rgba(255,255,255,0.10)', borderRadius: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart width={420} height={420}>
                    <Pie
                      data={question.options.map((opt, i) => {
                        const answers = getAnswersForQuestion(question.id);
                        const count = answers.filter(a => a === opt).length;
                        return { name: opt, value: count };
                      })}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={180}
                      innerRadius={110}
                      label={false}
                      isAnimationActive={false}
                      animationDuration={0}
                    >
                      {question.options.map((opt, i) => (
                        <Cell key={opt} fill={["#ffb3c6", "#ffe066", "#ffb347", "#a0e7e5", "#b4f8c8", "#fbe7c6"][i % 6]} />

                      ))}
                    </Pie>
                  </PieChart>
                </div>
              )}
              {/* Result summary breakdown */}
              {question.type === 'multiple-choice' && question.options ? (
                (() => {
                  const answers = getAnswersForQuestion(question.id);
                  const counts = question.options.map(opt => ({
                    option: opt,
                    count: answers.filter(a => a === opt).length
                  }));
                  const total = answers.length;
                  return (
                    <div style={{ width: 600, margin: '0 auto 0 auto', fontSize: 44, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.13)', borderRadius: 32, padding: 36 }}>
                      {counts.map(({ option, count }, i) => (
                        <div key={option} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                          <span style={{ display: 'inline-block', width: 36, height: 36, borderRadius: 18, background: ["#ffb3c6", "#ffe066", "#ffb347", "#a0e7e5", "#b4f8c8", "#fbe7c6"][i % 6], marginRight: 24 }}></span>
                          <span style={{ flex: 1 }}>{option}</span>
                          <span style={{ fontWeight: 900, color: '#fff', marginLeft: 24 }}>{total ? ((count / total) * 100).toFixed(1) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const answers = getAnswersForQuestion(question.id);
                  if (!answers.length) return <div style={{ color: '#fff', fontSize: 44, textAlign: 'center', margin: '48px 0' }}>No responses</div>;
                  // Build distribution for 1-10
                  const bins = Array.from({ length: 10 }, (_, i) => i + 1);
                  const dist = bins.map(val => ({
                    value: val,
                    count: answers.filter(a => Math.round(a) === val).length
                  }));
                  const maxCount = Math.max(...dist.map(d => d.count), 1);
                  const avg = (answers.reduce((a, b) => a + b, 0) / answers.length);
                  // Calculate percentages for each value
                  const total = answers.length;
                  const percentages = dist.map(d => ({
                    value: d.value,
                    percent: total ? ((d.count / total) * 100).toFixed(1) : '0.0'
                  }));
                  return (
                    <div style={{ color: '#fff', fontSize: 44, textAlign: 'center', margin: '48px 0', position: 'relative', minHeight: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <div style={{ marginBottom: 32 }}>
                        Average: <span style={{ fontWeight: 900 }}>{avg.toFixed(1)}</span> / 10
                      </div>
                      <div style={{
                        width: 900,
                        height: 400,
                        background: 'rgba(0,0,0,0.13)',
                        borderRadius: 48,
                        padding: 32,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        margin: '0 auto 32px auto',
                      }}>
                        <BarChart width={800} height={320} data={dist} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#fff2" />
                          <XAxis dataKey="value" stroke="#fff" fontSize={32} tick={{ fill: '#fff', fontWeight: 700 }} />
                          <YAxis stroke="#fff" fontSize={32} tick={{ fill: '#fff', fontWeight: 700 }} allowDecimals={false} domain={[0, maxCount]} />
                          <Bar dataKey="count" fill="#ffe066" barSize={56} radius={[16, 16, 0, 0]} />
                        </BarChart>
                      </div>
                      {/* Percentages 1-5 left, 6-10 right */}
                      <div style={{ width: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 80, fontSize: 36, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.10)', borderRadius: 32, padding: 36, fontFamily: 'monospace' }}>
                        <div style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          {percentages.slice(0, 5).map(({ value, percent }) => (
                            <div key={value} style={{ marginBottom: 16, minWidth: 180, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                              <span style={{ color: '#ffe066', fontWeight: 900, minWidth: 60, textAlign: 'right', display: 'inline-block', fontFamily: 'monospace' }}>{value}:</span>
                              <span style={{ color: '#fff', fontWeight: 700, minWidth: 70, textAlign: 'right', display: 'inline-block' }}>{percent}%</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          {percentages.slice(5, 10).map(({ value, percent }) => (
                            <div key={value} style={{ marginBottom: 16, minWidth: 180, display: 'flex', justifyContent: 'flex-start', gap: 8 }}>
                              <span style={{ color: '#ffe066', fontWeight: 900, minWidth: 48, textAlign: 'right', display: 'inline-block' }}>{value}:</span>
                              <span style={{ color: '#fff', fontWeight: 700, minWidth: 70, textAlign: 'right', display: 'inline-block' }}>{percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
            {/* Branding removed as per user request */}
          </StoryCaptureWrapper>
        </div>
      </div>
        ))
      )}

    </div>
  );
}


"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Wand2, ListChecks, SlidersHorizontal, Check, X, Share2, CheckCircle, Save, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { questions as suggestedQuestions } from '@/lib/questions';
import { type Question, type Quiz } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export function CreateQuizForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quizId, setQuizId] = useState<string | null>(null);

  const [quizTitle, setQuizTitle] = useState('My Feedback Quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'multiple-choice' | 'sliding-bar'>('multiple-choice');
  const [options, setOptions] = useState<string[]>(['', '']);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [isQuizCreated, setIsQuizCreated] = useState(false);
  const [quizLink, setQuizLink] = useState('');

  useEffect(() => {
    const id = searchParams.get('quizId');
    if (id && user) {
      const fetchQuiz = async () => {
        const quizDoc = await getDoc(doc(db, "quizzes", id));
        if (quizDoc.exists() && quizDoc.data().userId === user.uid) {
          const existingQuiz = quizDoc.data() as Quiz;
          setQuizId(quizDoc.id);
          setQuizTitle(existingQuiz.title);
          setQuestions(existingQuiz.questions.map((q, i) => ({ ...q, id: `db-${i}-${Date.now()}` })));
        } else {
           toast({
            variant: "destructive",
            title: "Quiz not found",
            description: "The quiz you are trying to edit does not exist or you don't have permission to edit it.",
          });
          router.push('/create');
        }
      }
      fetchQuiz();
    }
  }, [searchParams, user, router, toast]);

  const addQuestion = () => {
    if (newQuestionText.trim() === '') return;

    let questionToAdd: Question = {
      id: `custom-${questions.length + 1}-${Date.now()}`,
      text: newQuestionText,
      type: newQuestionType,
    };

    if (newQuestionType === 'multiple-choice') {
      const validOptions = options.map(o => o.trim()).filter(o => o !== '');
      if (validOptions.length < 2) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Multiple choice questions must have at least 2 options.",
        });
        return;
      }
      questionToAdd.options = validOptions;
    }

    setQuestions([...questions, questionToAdd]);
    setNewQuestionText('');
    setNewQuestionType('multiple-choice');
    setOptions(['', '']);
  };

  const addSuggestedQuestion = (question: Question) => {
    const questionWithUniqueId = { ...question, id: `suggested-${question.id}-${Date.now()}` };
    if (!questions.some(q => q.text === questionWithUniqueId.text)) {
        setQuestions([...questions, questionWithUniqueId]);
    }
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingQuestion({ ...questions[index] });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingQuestion(null);
  };

  const saveEditing = (index: number) => {
    if (editingQuestion) {
      if (editingQuestion.type === 'multiple-choice') {
        const validOptions = (editingQuestion.options ?? []).map(o => o.trim()).filter(o => o !== '');
        if (validOptions.length < 2) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Multiple choice questions must have at least 2 options.",
          });
          return;
        }
        editingQuestion.options = validOptions;
      }
      const newQuestions = [...questions];
      newQuestions[index] = editingQuestion;
      setQuestions(newQuestions);
      cancelEditing();
    }
  };

  const handleEditingQuestionChange = (field: keyof Question, value: any) => {
    if (editingQuestion) {
      const updatedQuestion = { ...editingQuestion, [field]: value };
      if (field === 'type') {
        if (value === 'sliding-bar') {
          delete updatedQuestion.options;
        } else if (value === 'multiple-choice' && !updatedQuestion.options) {
          updatedQuestion.options = ['', ''];
        }
      }
      setEditingQuestion(updatedQuestion);
    }
  }

  const handleEditingOptionChange = (optIndex: number, value: string) => {
    if (editingQuestion && editingQuestion.options) {
      const newOptions = [...editingQuestion.options];
      newOptions[optIndex] = value;
      handleEditingQuestionChange('options', newOptions);
    }
  };
  
  const addEditingOption = () => {
    if (editingQuestion && editingQuestion.options) {
       handleEditingQuestionChange('options', [...editingQuestion.options, '']);
    }
  };
  
  const removeEditingOption = (optIndex: number) => {
     if (editingQuestion && editingQuestion.options && editingQuestion.options.length > 2) {
      const newOptions = editingQuestion.options.filter((_, i) => i !== optIndex);
      handleEditingQuestionChange('options', newOptions);
    }
  };

  const saveQuiz = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Not authenticated", description: "You must be logged in to save a quiz." });
        return;
    }
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one question to your quiz.",
      });
      return;
    }
    
    // Create a clean version of questions for Firestore
    const questionsForDb = questions.map(({ id, ...rest }) => rest);

    const quizData: Omit<Quiz, 'id' | 'createdAt'> & { createdAt: any } = {
      userId: user.uid,
      title: quizTitle || 'My Feedback Quiz',
      questions: questionsForDb,
      createdAt: serverTimestamp()
    };

    try {
        let newQuizId;
        if (quizId) {
            const quizRef = doc(db, "quizzes", quizId);
            await updateDoc(quizRef, quizData);
            newQuizId = quizId;
        } else {
            const docRef = await addDoc(collection(db, "quizzes"), quizData);
            newQuizId = docRef.id;
            setQuizId(docRef.id);
        }

        toast({
            title: quizId ? "Quiz Updated!" : "Quiz Saved!",
            description: "Your quiz has been successfully saved.",
        });
        return newQuizId;
    } catch (error) {
        console.error("Error saving quiz: ", error);
        toast({ variant: "destructive", title: "Save failed", description: "There was an error saving your quiz." });
    }
  };

  const createAndShareQuiz = async () => {
    const newQuizId = await saveQuiz();
    if (!newQuizId) return;

    const url = `${window.location.origin}/quiz?id=${newQuizId}`;
    setQuizLink(url);
    setIsQuizCreated(true);
    copyToClipboard(url, "The quiz link has been copied to your clipboard.");
  };

  const copyToClipboard = (text: string, message: string) => {
     navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: message,
      });
    }, () => {
       toast({
        variant: "destructive",
        title: "Failed to Copy",
        description: "Could not copy the link. Please copy it manually.",
      });
    });
  }
  
  if (isQuizCreated) {
    return (
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="items-center text-center">
            <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline mt-4">{quizId ? 'Quiz Updated!' : 'Quiz Created!'}</CardTitle>
            <CardDescription>Your quiz is ready to be shared with your friends.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <p className="font-semibold">Share this link:</p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted p-2">
                <Input readOnly value={quizLink} className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"/>
                <Button onClick={() => copyToClipboard(quizLink, "The quiz link has been copied to your clipboard.")}>
                    <Share2 className="mr-2 h-4 w-4"/> Copy Link
                </Button>
            </div>
        </CardContent>
         <CardFooter className="flex-col sm:flex-row justify-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" /> Go to Home
            </Button>
            <Button onClick={() => {
                setIsQuizCreated(false);
                setQuizId(null);
                setQuizTitle('My Feedback Quiz');
                setQuestions([]);
                router.push('/create');
            }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create a New Quiz
            </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <PlusCircle className="text-primary" />
            {quizId ? "Edit Your Quiz" : "Create Your Quiz"}
          </CardTitle>
          <CardDescription>
            {quizId ? "Edit the title and questions of your quiz." : "Add a title and some questions, or choose from our suggestions below."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
             <Label htmlFor="quiz-title" className="text-lg font-semibold">Quiz Title</Label>
             <Input 
                id="quiz-title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="E.g. How well do you know me?"
                className="text-lg"
              />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Add a Custom Question</h3>
            <Textarea
              placeholder="E.g., How good am I at listening?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="text-base"
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={newQuestionType} onValueChange={(value: any) => setNewQuestionType(value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice"><ListChecks className="inline-block mr-2 h-4 w-4" />Multiple Choice</SelectItem>
                  <SelectItem value="sliding-bar"><SlidersHorizontal className="inline-block mr-2 h-4 w-4" />Sliding Bar</SelectItem>
                </SelectContent>
              </Select>
               <Button onClick={addQuestion} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
             {newQuestionType === 'multiple-choice' && (
              <div className="space-y-2 pt-2">
                <Label>Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeOption(index)} disabled={options.length <= 2}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Your Quiz Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex flex-col rounded-md border p-4"
                  >
                   {editingIndex === index && editingQuestion ? (
                      <div className="space-y-4">
                         <Textarea
                          value={editingQuestion.text}
                          onChange={(e) => handleEditingQuestionChange('text', e.target.value)}
                          className="text-base"
                        />
                        <Select
                          value={editingQuestion.type}
                          onValueChange={(value: any) => handleEditingQuestionChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Question Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice"><ListChecks className="inline-block mr-2 h-4 w-4" />Multiple Choice</SelectItem>
                            <SelectItem value="sliding-bar"><SlidersHorizontal className="inline-block mr-2 h-4 w-4" />Sliding Bar</SelectItem>
                          </SelectContent>
                        </Select>

                        {editingQuestion.type === 'multiple-choice' && (
                          <div className="space-y-2 pt-2">
                            <Label>Options</Label>
                            {(editingQuestion.options || []).map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => handleEditingOptionChange(optIndex, e.target.value)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeEditingOption(optIndex)} disabled={(editingQuestion.options || []).length <= 2}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addEditingOption}>
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                            </Button>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={cancelEditing}> <X className="mr-2 h-4 w-4" /> Cancel</Button>
                          <Button onClick={() => saveEditing(index)}> <Check className="mr-2 h-4 w-4" /> Save</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {q.type === 'multiple-choice' ? <ListChecks className="h-5 w-5 mt-1 text-muted-foreground" /> : <SlidersHorizontal className="h-5 w-5 mt-1 text-muted-foreground" />}
                            <p className="flex-1 break-words">{q.text}</p>
                          </div>
                           <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => startEditing(index)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {q.type === 'multiple-choice' && q.options && (
                          <div className="mt-3 flex flex-wrap gap-2 pl-8">
                            {q.options.map(opt => (
                              <Badge key={opt} variant="secondary">{opt}</Badge>
                            ))}
                          </div>
                        )}
                        {q.type === 'sliding-bar' && (
                            <div className="mt-4 flex items-center gap-2 pl-8">
                                <span className="text-sm text-muted-foreground">0</span>
                                <div className="h-1 w-full rounded-full bg-muted"></div>
                                <span className="text-sm text-muted-foreground">10</span>
                            </div>
                        )}
                      </>
                   )}
                  </motion.div>
                ))}
              </CardContent>
               <CardFooter className="flex-col sm:flex-row gap-2">
                  <Button onClick={createAndShareQuiz} size="lg" disabled={questions.length === 0}>
                    <Share2 className="mr-2 h-5 w-5" />
                    {quizId ? 'Update & Get Link' : 'Finish & Get Link'}
                  </Button>
                   <Button onClick={saveQuiz} size="lg" variant="secondary" disabled={questions.length === 0}>
                    <Save className="mr-2 h-5 w-5" />
                    {quizId ? 'Update Quiz' : 'Save Quiz'}
                  </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Wand2 className="text-primary" />
            Suggested Questions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedQuestions.map((q) => (
              <Button key={q.id} variant="outline" className="justify-start h-auto py-2" onClick={() => addSuggestedQuestion(q)}>
                <PlusCircle className="h-4 w-4 mr-2 shrink-0"/>
                <span className="text-left whitespace-normal">{q.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
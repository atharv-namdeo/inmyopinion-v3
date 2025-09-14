"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Answers } from '@/lib/types';

const ANSWERS_STORAGE_KEY = 'feedback-flow-answers';

export function useQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);
        if (storedAnswers) {
          setAnswers(JSON.parse(storedAnswers));
        }
      } catch (error) {
        console.error('Failed to load answers from local storage', error);
      }
      setIsLoaded(true);
    }
  }, []);

  const setAnswer = useCallback(
    (questionId: string, value: any) => {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(newAnswers));
        } catch (error) {
          console.error('Failed to save answer to local storage', error);
        }
      }
    },
    [answers]
  );

  const clearAnswers = useCallback(() => {
    setAnswers({});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ANSWERS_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear answers from local storage', error);
      }
    }
  }, []);

  return { answers, setAnswer, clearAnswers, isLoaded };
}

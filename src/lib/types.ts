
import { FieldValue, Timestamp } from 'firebase/firestore';

export type Question = {
  id: string;
  type: 'multiple-choice' | 'sliding-bar';
  text: string;
  options?: string[];
};

export type Answers = Record<string, any>;

export type Quiz = {
  id: string;
  userId: string;
  title: string;
  questions: Omit<Question, 'id'>[];
  createdAt: Timestamp;
};

export type UserProfile = {
    uid: string;
    email: string;
    username: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export type QuizResponse = {
    id: string;
    quizId: string;
    answers: Answers;
    createdAt: string;
}

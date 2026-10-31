
import { FieldValue, Timestamp } from 'firebase/firestore';

export type Question = {
  id: string;
  type: 'multiple-choice' | 'sliding-bar';
  text: string;
  options?: string[];
};

export type Answers = Record<string, any>;

export type AnonymityMode = 'allow_choice' | 'always_anon' | 'always_named';

export type Quiz = {
  id: string;
  userId: string;
  title: string;
  questions: Question[];
  createdAt: Timestamp;
  endMessage?: string; // Optional custom end message for quiz completion
  anonymityMode?: AnonymityMode;
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
    isAnonymous?: boolean;
    respondentName?: string;
}

// group spill (anonymous voting and roasts among a named group)

export type GroupQuestionType = 'member_pick' | 'behavior_roast' | 'short_answer';

export type GroupQuestion = {
    id: string;
    text: string; // e.g. "who's most likely to ghost you?"
    type?: GroupQuestionType;
};

export type Group = {
    id: string;
    userId: string;
    name: string;            // e.g. "the squad"
    members: string[];       // names of everyone in the group
    questions: GroupQuestion[];
    createdAt: Timestamp;
    anonymityMode?: AnonymityMode;
};

export type RoastAnswer = {
    targetMember?: string;
    text?: string;
    allMembers?: Record<string, string>; // memberName -> roast text
};

// A single person's ballot.
export type GroupVote = {
    id: string;
    groupId: string;
    voterName?: string;
    isAnonymous?: boolean;
    picks: Record<string, string>; // questionId -> member name
    roasts?: Record<string, RoastAnswer>; // questionId -> roast details
    shortAnswers?: Record<string, string>; // questionId -> text answer
    createdAt: string;
};

"use client";

import { type Question } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Props = {
  question: Question;
  value: string;
  onAnswerChange: (value: string) => void;
};

export function MultipleChoiceQuestion({
  question,
  value,
  onAnswerChange,
}: Props) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onAnswerChange}
      className="space-y-3"
    >
      {question.options?.map((option) => (
        <Label
          key={option}
          htmlFor={option}
          className="flex cursor-pointer items-center space-x-3 rounded-md border p-4 transition-colors hover:bg-accent/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
        >
          <RadioGroupItem value={option} id={option} />
          <span>{option}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}

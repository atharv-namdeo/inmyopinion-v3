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
      {question.options?.map((option, i) => {
        const selected = value === option;
        return (
          <Label
            key={option}
            htmlFor={option}
            className={`group/opt flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-primary/50 ${
              selected
                ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border bg-secondary/20'
            }`}
          >
            <span className="font-mono text-xs text-muted-foreground group-hover/opt:text-primary">
              {String.fromCharCode(65 + i)}
            </span>
            <RadioGroupItem value={option} id={option} />
            <span className="text-base">{option}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

"use client";

import { type Question } from '@/lib/types';
import { Slider } from '@/components/ui/slider';

type Props = {
  question: Question;
  value: number;
  onAnswerChange: (value: number) => void;
};

export function SlidingBarQuestion({ question, value, onAnswerChange }: Props) {
  const currentValue = value ?? 5;
  return (
    <div className="flex flex-col items-center pt-10">
      <div className="mb-2 display text-6xl font-semibold text-primary tabular-nums">
        {currentValue}
      </div>
      <p className="mb-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        out of ten
      </p>
      <div className="relative mb-4 w-full max-w-sm">
        <Slider
          value={[currentValue]}
          onValueChange={(newValue) => onAnswerChange(newValue[0])}
          max={10}
          step={1}
        />
      </div>
      <div className="flex w-full max-w-sm justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Not at all</span>
        <span>Absolutely</span>
      </div>
    </div>
  );
}

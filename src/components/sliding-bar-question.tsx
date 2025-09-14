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
    <div className="flex flex-col items-center pt-8">
      <div className="relative mb-6 w-full max-w-xs">
        <div
          className="absolute -top-10 rounded-md bg-primary px-3 py-1 text-primary-foreground"
          style={{
            left: `${currentValue * 10}%`,
            transform: 'translateX(-50%)',
            transition: 'left 0.2s ease-out',
          }}
        >
          <span className="text-lg font-bold">{currentValue}</span>
        </div>
        <Slider
          value={[currentValue]}
          onValueChange={(newValue) => onAnswerChange(newValue[0])}
          max={10}
          step={1}
        />
      </div>
      <div className="flex w-full justify-between text-sm text-muted-foreground">
        <span>0</span>
        <span>10</span>
      </div>
    </div>
  );
}

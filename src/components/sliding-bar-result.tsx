
"use client";

import { type Question } from '@/lib/types';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Props = {
  question: Question;
  answers: number[];
};

export function SlidingBarResult({ question, answers }: Props) {
  const totalResponses = answers.length;

  const answerCounts: Record<number, number> = {};
  for (let i = 0; i <= 10; i++) {
    answerCounts[i] = 0;
  }
  
  answers.forEach(answer => {
    const value = Math.round(answer);
    if (answerCounts.hasOwnProperty(value)) {
      answerCounts[value]++;
    }
  });

  const chartData = Object.entries(answerCounts).map(([name, value]) => ({
    name,
    count: value
  }));

  if (totalResponses === 0) {
    return <p className="text-muted-foreground">No responses for this question yet.</p>;
  }

  const average = answers.reduce((sum, val) => sum + val, 0) / totalResponses;
  
  return (
    <div>
        <div className="mb-4">
            <CardTitle>Response Distribution</CardTitle>
            <CardDescription>{totalResponses} total response(s) &middot; Average: {average.toFixed(1)}</CardDescription>
        </div>
        <div className="w-full h-[300px]">
            <ChartContainer config={{
                count: {
                    label: "Responses",
                    color: "hsl(var(--chart-1))",
                },
            }} className="w-full h-full">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        allowDecimals={false}
                    />
                    <Tooltip 
                        cursor={false} 
                        content={<ChartTooltipContent indicator="dot" />} 
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    </div>
  );
}

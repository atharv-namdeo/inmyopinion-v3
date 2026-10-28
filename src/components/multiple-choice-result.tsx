
"use client";

import { type Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

type Props = {
  question: Question;
  answers: string[];
};

const CHART_COLORS = [
    '#fb4d1e', // ember
    '#f7a13b', // amber
    '#f4ede1', // cream
    '#c9532a', // burnt
    '#e8b04b', // gold
    '#a8d5c8', // teal accent
    '#8a8079', // stone
    '#d98c6a', // clay
    '#b5651d', // ochre
    '#6b8f8a', // slate teal
];

export function MultipleChoiceResult({ question, answers }: Props) {
  const totalResponses = answers.length;

  const answerCounts = question.options!.reduce((acc, option) => {
    acc[option] = 0;
    return acc;
  }, {} as Record<string, number>);

  answers.forEach(answer => {
    if (answerCounts.hasOwnProperty(answer)) {
      answerCounts[answer]++;
    }
  });

  const chartData = Object.entries(answerCounts).map(([name, value]) => ({
    name,
    value,
    fill: CHART_COLORS[question.options!.indexOf(name) % CHART_COLORS.length]
  })).filter(data => data.value > 0);


  if (totalResponses === 0) {
    return <p className="text-muted-foreground">No responses for this question yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="w-full h-[250px]">
            <ChartContainer config={{}} className="w-full h-full">
                <PieChart>
                    <Tooltip 
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />} 
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        isAnimationActive={false}
                        animationDuration={0}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </div>
        <div>
            <CardHeader className="p-0 mb-4">
                <CardTitle>Response Breakdown</CardTitle>
                <CardDescription>{totalResponses} total response(s)</CardDescription>
            </CardHeader>
            <ul className="space-y-2">
                {Object.entries(answerCounts).map(([option, count], index) => {
                    const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                    return (
                        <li key={option} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                <span>{option}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">{count}</span>
                                <span className="text-sm text-muted-foreground w-12 text-right">{percentage.toFixed(0)}%</span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    </div>
  );
}

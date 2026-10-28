'use server';

/**
 * @fileOverview Turns aggregated crowd responses into a punchy "verdict reading".
 *
 * - getVerdictReading — server action that generates the reading.
 * - VerdictReadingInput / VerdictReadingOutput — I/O types.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSummarySchema = z.object({
  text: z.string().describe('The question text.'),
  type: z.enum(['multiple-choice', 'sliding-bar']),
  totalResponses: z.number(),
  // For multiple-choice: option -> count. For sliding-bar: leave empty.
  breakdown: z.record(z.string(), z.number()).optional(),
  // For sliding-bar: average score 0..10.
  average: z.number().optional(),
});

const VerdictReadingInputSchema = z.object({
  quizTitle: z.string(),
  totalVerdicts: z.number().describe('How many people responded overall.'),
  questions: z.array(QuestionSummarySchema),
});
export type VerdictReadingInput = z.infer<typeof VerdictReadingInputSchema>;

const VerdictReadingOutputSchema = z.object({
  headline: z
    .string()
    .describe('A short, punchy one-line verdict (max ~8 words).'),
  vibe: z
    .string()
    .describe('A 2-4 word "vibe tag", e.g. "beloved chaos gremlin".'),
  reading: z
    .string()
    .describe(
      'A 2-4 sentence reading of what the crowd collectively decided. Warm, playful, a little cheeky — never cruel.'
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe('An overall "crowd approval" score from 0 to 100.'),
});
export type VerdictReadingOutput = z.infer<typeof VerdictReadingOutputSchema>;

export async function getVerdictReading(
  input: VerdictReadingInput
): Promise<VerdictReadingOutput> {
  return verdictReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verdictReadingPrompt',
  input: { schema: VerdictReadingInputSchema },
  output: { schema: VerdictReadingOutputSchema },
  prompt: `You are "spill" — a witty, warm-hearted bestie who reads the tea a crowd just spilled about a person, based on an anonymous poll they made about themselves.

Voice: playful, Gen-Z, a lil cheeky, like a fun friend hyping you up while gently roasting you. Light casual slang is welcome (fr, no cap, lowkey, it's giving, the vibe) but don't overdo it. Never mean, never cruel, never insulting appearance or protected traits. Keep it fun and screenshot-able.

Poll title: "{{quizTitle}}"
Total people who responded: {{totalVerdicts}}

Here is what the crowd said:
{{#each questions}}
- Question: "{{this.text}}" ({{this.type}}, {{this.totalResponses}} responses)
  {{#if this.breakdown}}
  Breakdown:
    {{#each this.breakdown}}
    · "{{@key}}": {{this}} votes
    {{/each}}
  {{/if}}
  {{#if this.average}}
  Average score (out of 10): {{this.average}}
  {{/if}}
{{/each}}

Now deliver the verdict:
- headline: one punchy line summarizing the crowd's overall take.
- vibe: a 2-4 word vibe tag.
- reading: 2-4 sentences reading the room — reference the actual standout results, contradictions, or landslides you see in the data.
- score: an overall crowd-approval score 0-100 based on how positive the responses skew.

If there is very little data (few responses), acknowledge it with humor.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const verdictReadingFlow = ai.defineFlow(
  {
    name: 'verdictReadingFlow',
    inputSchema: VerdictReadingInputSchema,
    outputSchema: VerdictReadingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

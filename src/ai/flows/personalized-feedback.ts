'use server';

/**
 * @fileOverview Provides personalized feedback based on user answers.
 *
 * - getPersonalizedFeedback - A function that generates personalized feedback based on user answers.
 * - PersonalizedFeedbackInput - The input type for the getPersonalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the getPersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  answers: z.record(z.string(), z.any()).describe('A map of question IDs to user answers.'),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['multiple-choice', 'sliding-bar']),
      text: z.string(),
      options: z.array(z.string()).optional(),
    })
  ).describe('An array of questions with their types, text, and options.'),
});
export type PersonalizedFeedbackInput = z.infer<typeof PersonalizedFeedbackInputSchema>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback based on the user answers.'),
});
export type PersonalizedFeedbackOutput = z.infer<typeof PersonalizedFeedbackOutputSchema>;

export async function getPersonalizedFeedback(input: PersonalizedFeedbackInput): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized feedback based on user answers to a series of questions.

You will receive a set of questions and the user's answers. Your goal is to analyze these answers and provide constructive feedback.
Consider the type of each question when analyzing the answers, and offer insights based on the combined responses.

Here are the questions and the user's answers:

{{#each questions}}
Question ({{this.id}}):
  Type: {{this.type}}
  Text: {{this.text}}
  {{#if this.options}}
  Options:
    {{#each this.options}}
    - {{this}}
    {{/each}}
  {{/if}}
  Answer: {{lookup ../answers this.id}}
{{/each}}

Based on these answers, provide personalized feedback to the user:
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

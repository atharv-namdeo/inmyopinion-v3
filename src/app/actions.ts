'use server';

import {
  getVerdictReading,
  type VerdictReadingInput,
  type VerdictReadingOutput,
} from '@/ai/flows/verdict-reading';

export type VerdictResult =
  | { status: 'ok'; reading: VerdictReadingOutput }
  | { status: 'no-key' }
  | { status: 'error'; message: string };

/**
 * Server action the results page calls to generate an AI verdict reading.
 * Degrades gracefully: if no Google AI key is configured, returns 'no-key' so
 * the UI can show a friendly setup note instead of crashing.
 */
export async function requestVerdictReading(
  input: VerdictReadingInput
): Promise<VerdictResult> {
  const hasKey =
    !!process.env.GEMINI_API_KEY ||
    !!process.env.GOOGLE_API_KEY ||
    !!process.env.GOOGLE_GENAI_API_KEY;

  if (!hasKey) {
    return { status: 'no-key' };
  }

  try {
    const reading = await getVerdictReading(input);
    return { status: 'ok', reading };
  } catch (err: any) {
    console.error('Verdict reading failed: ', err);
    const message: string =
      typeof err?.message === 'string' ? err.message : 'Unknown error';
    if (/api key|permission|credential|unauthenticated/i.test(message)) {
      return { status: 'no-key' };
    }
    return { status: 'error', message };
  }
}

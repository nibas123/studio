'use server';

/**
 * @fileOverview A flow that uses AI to determine if the user forgot to clock out.
 *
 * - aiClockOutAlert - A function that determines if the user forgot to clock out and returns a boolean.
 * - AiClockOutAlertInput - The input type for the aiClockOutAlert function.
 * - AiClockOutAlertOutput - The return type for the aiClockOutAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiClockOutAlertInputSchema = z.object({
  historicalData: z.string().describe('Historical clock-in and clock-out data, including dates and times.'),
  currentTime: z.string().describe('The current time.'),
  dailyWorkHourLimit: z.number().describe('The user specified daily work hour limit'),
});
export type AiClockOutAlertInput = z.infer<typeof AiClockOutAlertInputSchema>;

const AiClockOutAlertOutputSchema = z.object({
  forgotToClockOut: z.boolean().describe('Whether the AI determines the user likely forgot to clock out.'),
});
export type AiClockOutAlertOutput = z.infer<typeof AiClockOutAlertOutputSchema>;

export async function aiClockOutAlert(input: AiClockOutAlertInput): Promise<AiClockOutAlertOutput> {
  return aiClockOutAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiClockOutAlertPrompt',
  input: {schema: AiClockOutAlertInputSchema},
  output: {schema: AiClockOutAlertOutputSchema},
  prompt: `You are an AI assistant that analyzes user work patterns to determine if they forgot to clock out.

  Here is their historical clock-in and clock-out data:
  {{historicalData}}

  The current time is: {{currentTime}}.

  The user specified daily work hour limit is: {{dailyWorkHourLimit}} hours.

  Based on this information, determine if the user likely forgot to clock out. Return true if they likely forgot, and false if they likely did not.
  Be conservative and only return true if you are at least 90% sure they forgot to clock out.
  Consider whether the current time is significantly past their typical clock-out time.
  Consider whether they worked their daily work hour limit.
  If you return true, be very confident that the user forgot to clock out.
`,
});

const aiClockOutAlertFlow = ai.defineFlow(
  {
    name: 'aiClockOutAlertFlow',
    inputSchema: AiClockOutAlertInputSchema,
    outputSchema: AiClockOutAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

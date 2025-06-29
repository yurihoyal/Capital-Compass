'use server';

/**
 * @fileOverview An AI travel assistant that answers natural language questions about booking with points.
 *
 * - travelAssistant - A function that answers travel-related questions.
 * - TravelAssistantInput - The input type for the travelAssistant function.
 * - TravelAssistantOutput - The return type for the travelAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TravelAssistantInputSchema = z.object({
  query: z.string().describe('The travel-related question from the agent.'),
});
export type TravelAssistantInput = z.infer<typeof TravelAssistantInputSchema>;

const TravelAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the travel-related question.'),
});
export type TravelAssistantOutput = z.infer<typeof TravelAssistantOutputSchema>;

export async function travelAssistant(input: TravelAssistantInput): Promise<TravelAssistantOutput> {
  return travelAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'travelAssistantPrompt',
  input: {schema: TravelAssistantInputSchema},
  output: {schema: TravelAssistantOutputSchema},
  prompt: `You are a travel assistant expert specializing in Capital Vacations bookings.

You will use this information to answer questions about booking travel with points, and give the agent accurate and up-to-date information.

Use the following question to give your answer.

Question: {{{query}}}`,
});

const travelAssistantFlow = ai.defineFlow(
  {
    name: 'travelAssistantFlow',
    inputSchema: TravelAssistantInputSchema,
    outputSchema: TravelAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

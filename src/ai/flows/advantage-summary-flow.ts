'use server';

/**
 * @fileOverview Generates a concise summary for the Advantage Illustrator.
 *
 * - getAdvantageSummary - A function that creates a talking point for sales agents.
 * - AdvantageSummaryInput - The input type for the function.
 * - AdvantageSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvantageSummaryInputSchema = z.object({
  years: z.number().describe('The projection timeframe in years.'),
  savings: z.number().describe('The total avoidable cost (regret gap).'),
  tier: z.string().describe('The new projected VIP tier for the owner.'),
});
export type AdvantageSummaryInput = z.infer<typeof AdvantageSummaryInputSchema>;

const AdvantageSummaryOutputSchema = z.object({
  summary: z.string().describe('A single, encouraging sentence summarizing the benefits of restructuring.'),
});
export type AdvantageSummaryOutput = z.infer<typeof AdvantageSummaryOutputSchema>;

export async function getAdvantageSummary(input: AdvantageSummaryInput): Promise<AdvantageSummaryOutput> {
  return advantageSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advantageSummaryPrompt',
  input: {schema: AdvantageSummaryInputSchema},
  output: {schema: AdvantageSummaryOutputSchema},
  prompt: `You are an expert financial assistant creating a talking point for a sales agent.
The audience is between 50 and 76 years old.
Your task is to write a single, positive, and easy-to-understand sentence summarizing the financial benefit of a proposed ownership restructure.

- The sentence must be encouraging and focus on the positive outcome.
- Use plain, simple English and avoid complex jargon.
- Clearly state the total avoidable cost (savings) and the timeframe.
- Mention the benefit of achieving the new VIP tier.

Data:
- Projection Timeframe: {{{years}}} years
- Total Avoidable Cost: {{{savings}}}
- New VIP Tier: {{{tier}}}

Example format: "By restructuring today, you could avoid over $SAVINGS in future costs over the next YEARS years, all while enjoying the exclusive travel benefits of the TIER tier."
`,
});

const advantageSummaryFlow = ai.defineFlow(
  {
    name: 'advantageSummaryFlow',
    inputSchema: AdvantageSummaryInputSchema,
    outputSchema: AdvantageSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

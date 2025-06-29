'use server';

/**
 * @fileOverview Calculates the VIP tier based on the total points.
 *
 * - calculateVipTier - A function that calculates the VIP tier.
 * - CalculateVipTierInput - The input type for the calculateVipTier function.
 * - CalculateVipTierOutput - The return type for the calculateVipTier function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateVipTierInputSchema = z.object({
  totalPoints: z
    .number()
    .describe('The total points of the owner, must be a number.'),
});
export type CalculateVipTierInput = z.infer<typeof CalculateVipTierInputSchema>;

const CalculateVipTierOutputSchema = z.object({
  vipTier: z
    .enum(['Preferred', 'Silver', 'Gold', 'Platinum'])
    .describe('The VIP tier of the owner.'),
});
export type CalculateVipTierOutput = z.infer<typeof CalculateVipTierOutputSchema>;

export async function calculateVipTier(input: CalculateVipTierInput): Promise<CalculateVipTierOutput> {
  return calculateVipTierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateVipTierPrompt',
  input: {schema: CalculateVipTierInputSchema},
  output: {schema: CalculateVipTierOutputSchema},
  prompt: `You are an expert at determining VIP tiers based on point values.

Given the following point total, determine the VIP tier.

VIP Tier Ranges:
- Preferred: 0-299,999
- Silver: 300,000-499,999
- Gold: 500,000-999,999
- Platinum: 1,000,000+

Point Total: {{{totalPoints}}}

Return the VIP tier.
`,
});

const calculateVipTierFlow = ai.defineFlow(
  {
    name: 'calculateVipTierFlow',
    inputSchema: CalculateVipTierInputSchema,
    outputSchema: CalculateVipTierOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

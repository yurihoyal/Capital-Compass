import { z } from 'zod';

export const ownershipTypes = ['Deeded', 'Club'] as const;
export const painPoints = ['Booking', 'Exit', 'Fees', 'Flexibility', 'Usage'] as const;
export const redemptionTypes = ['Travel', 'Maintenance Fees', 'Capital Access'] as const;
export const loanTerms = [60, 120, 180, 240] as const; // 5, 10, 15, 20 years in months

export const OwnerProfileSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required.'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  ownershipType: z.enum(ownershipTypes),
  currentPoints: z.coerce.number().min(0),
  maintenanceFee: z.coerce.number().min(0),
  currentLoanBalance: z.coerce.number().min(0),
  currentLoanInterestRate: z.coerce.number().min(0).max(100),
  currentLoanTerm: z.coerce.number().min(0),
  painPoints: z.array(z.enum(painPoints)).optional(),
});
export type OwnerProfile = z.infer<typeof OwnerProfileSchema>;

export const UpgradeProposalSchema = z.object({
  newPointsAdded: z.coerce.number().min(0),
  convertedDeedsToPoints: z.coerce.number().min(0),
  newLoanAmount: z.coerce.number().min(0),
  newLoanTerm: z.coerce.number().min(0),
  newLoanInterestRate: z.coerce.number().min(0).max(100),
  projectedMF: z.coerce.number().min(0),
});
export type UpgradeProposal = z.infer<typeof UpgradeProposalSchema>;

export const CreditCardRewardsSchema = z.object({
  estimatedAnnualSpend: z.coerce.number().min(0),
  redemptionType: z.enum(redemptionTypes),
  rewardRate: z.coerce.number().min(0),
  calculatedSavings: z.coerce.number().min(0).optional(),
});
export type CreditCardRewards = z.infer<typeof CreditCardRewardsSchema>;

export interface ComparisonItem {
    feature: string;
    now: string | number | React.ReactNode;
    new: string | number | React.ReactNode;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

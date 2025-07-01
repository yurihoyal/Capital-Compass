import { z } from 'zod';

export const ownershipTypes = ['Deeded Only', 'Capital Club Member'] as const;
export const redemptionTypes = ['Travel', 'Maintenance Fees', 'Capital Access'] as const;
export const loanTerms = [60, 120, 180, 240] as const; // 5, 10, 15, 20 years in months

export const OwnerProfileSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required.'),
  ownerId: z.string().optional(),
  ownershipType: z.enum(ownershipTypes),
  deedPointValue: z.coerce.number().min(0).optional(),
  currentPoints: z.coerce.number().min(0),
  maintenanceFee: z.coerce.number().min(0),
  specialAssessment: z.coerce.number().min(0),
  currentMonthlyLoanPayment: z.coerce.number().min(0).optional(),
  currentLoanTerm: z.coerce.number().min(0).optional(),
  mfInflationRate: z.coerce.number().min(1).max(30),
});
export type OwnerProfile = z.infer<typeof OwnerProfileSchema>;

export const UpgradeProposalSchema = z.object({
  newPointsAdded: z.coerce.number().min(0),
  convertedDeedsToPoints: z.coerce.number().min(0),
  newLoanAmount: z.coerce.number().min(0),
  newLoanTerm: z.coerce.number().min(0),
  newLoanInterestRate: z.coerce.number().min(0).max(100),
  projectedMF: z.coerce.number().min(0),
  newMfInflationRate: z.coerce.number().min(1).max(30),
});
export type UpgradeProposal = z.infer<typeof UpgradeProposalSchema>;

export const RewardsCalculatorSchema = z.object({
  monthlySpend: z.coerce.number().min(0).optional().default(0),
  // Calculated fields
  totalRewards: z.coerce.number().min(0).optional(),
  annualCredit: z.coerce.number().min(0).optional(),
  monthlyCredit: z.coerce.number().min(0).optional(),
});
export type RewardsCalculatorData = z.infer<typeof RewardsCalculatorSchema>;

export const TravelServicesCalculatorSchema = z.object({
  pointsForTravel: z.coerce.number().min(0).optional().default(0),
  // Calculated fields
  cashValueOfPoints: z.coerce.number().min(0).optional(),
});
export type TravelServicesCalculatorData = z.infer<typeof TravelServicesCalculatorSchema>;


export interface ComparisonItem {
    feature: string;
    now: string | number | React.ReactNode;
    new: string | number | React.ReactNode;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

'use server';

import { calculateVipTier, CalculateVipTierOutput } from "@/ai/flows/vip-tier-calculator";
import { travelAssistant, TravelAssistantOutput } from "@/ai/flows/travel-assistant";
import { getAdvantageSummary as getAdvantageSummaryFlow, AdvantageSummaryInput, AdvantageSummaryOutput } from "@/ai/flows/advantage-summary-flow";

export async function getVipTier(totalPoints: number): Promise<CalculateVipTierOutput> {
    try {
        const result = await calculateVipTier({ totalPoints });
        return result;
    } catch (error) {
        console.error('Error in getVipTier server action:', error);
        // Fallback logic
        if (totalPoints >= 1000000) return { vipTier: 'Platinum' };
        if (totalPoints >= 500000) return { vipTier: 'Gold' };
        if (totalPoints >= 300000) return { vipTier: 'Silver' };
        return { vipTier: 'Preferred' };
    }
}

export async function getTravelAssistantResponse(query: string): Promise<TravelAssistantOutput> {
    const result = await travelAssistant({ query });
    return result;
}

export async function getAdvantageSummary(input: AdvantageSummaryInput): Promise<AdvantageSummaryOutput> {
    const result = await getAdvantageSummaryFlow(input);
    return result;
}

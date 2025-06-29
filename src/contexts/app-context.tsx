'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { OwnerProfile, UpgradeProposal, CreditCardRewards, OwnerProfileSchema, UpgradeProposalSchema, CreditCardRewardsSchema, ownershipTypes, redemptionTypes } from '@/types';
import { getVipTier } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"
import { calculateMonthlyPayment, generateCostProjection } from '@/lib/financial';

const DEEDED_INFLATION = 8;
const CLUB_INFLATION = 3;

interface AppState {
  ownerProfile: OwnerProfile;
  upgradeProposal: UpgradeProposal;
  creditCardRewards: CreditCardRewards;
  isCalculating: boolean;
  costProjectionData: { year: number, currentCost: number, newCost: number }[];
  projectionYears: 10 | 20;
}

const initialOwnerProfile: OwnerProfile = {
  ownerName: '',
  phone: '',
  email: '',
  ownershipType: ownershipTypes[1], // Club
  currentPoints: 150000,
  maintenanceFee: 2000,
  currentLoanBalance: 10000,
  currentLoanInterestRate: 8.5,
  currentLoanTerm: 5,
  painPoints: [],
  currentVIPLevel: 'Preferred',
};

const initialUpgradeProposal: UpgradeProposal = {
  newPointsAdded: 50000,
  convertedDeedsToPoints: 0,
  newLoanAmount: 25000,
  newLoanTerm: 10,
  newLoanInterestRate: 7.5,
  projectedMF: 2500,
  totalPointsAfterUpgrade: 200000,
  projectedVIPLevel: 'Preferred',
};

const initialCreditCardRewards: CreditCardRewards = {
  estimatedAnnualSpend: 10000,
  redemptionType: redemptionTypes[0], // Travel
  rewardRate: 1.5,
  calculatedSavings: 150,
};

const initialState: AppState = {
  ownerProfile: initialOwnerProfile,
  upgradeProposal: initialUpgradeProposal,
  creditCardRewards: initialCreditCardRewards,
  isCalculating: false,
  costProjectionData: [],
  projectionYears: 10,
};

type Action =
  | { type: 'UPDATE_OWNER_PROFILE'; payload: Partial<OwnerProfile> }
  | { type: 'UPDATE_UPGRADE_PROPOSAL'; payload: Partial<UpgradeProposal> }
  | { type: 'UPDATE_CREDIT_CARD_REWARDS'; payload: Partial<CreditCardRewards> }
  | { type: 'SET_IS_CALCULATING'; payload: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'SET_PROJECTION_YEARS'; payload: 10 | 20 }
  | { type: 'CALCULATE_ALL' };


const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_OWNER_PROFILE':
      return { ...state, ownerProfile: { ...state.ownerProfile, ...action.payload } };
    case 'UPDATE_UPGRADE_PROPOSAL':
      return { ...state, upgradeProposal: { ...state.upgradeProposal, ...action.payload } };
    case 'UPDATE_CREDIT_CARD_REWARDS':
        return { ...state, creditCardRewards: { ...state.creditCardRewards, ...action.payload } };
    case 'SET_IS_CALCULATING':
      return { ...state, isCalculating: action.payload };
    case 'RESET_STATE':
        return {
            ...initialState,
            costProjectionData: generateCostProjection(
                initialState.projectionYears,
                initialState.ownerProfile.maintenanceFee,
                initialState.ownerProfile.ownershipType === 'Deeded' ? DEEDED_INFLATION : CLUB_INFLATION,
                initialState.ownerProfile.currentLoanBalance,
                initialState.ownerProfile.currentLoanInterestRate,
                initialState.ownerProfile.currentLoanTerm,
                initialState.upgradeProposal.projectedMF,
                CLUB_INFLATION,
                initialState.upgradeProposal.newLoanAmount,
                initialState.upgradeProposal.newLoanInterestRate,
                initialState.upgradeProposal.newLoanTerm
            )
        };
    case 'SET_PROJECTION_YEARS':
        return { ...state, projectionYears: action.payload };
    case 'CALCULATE_ALL': {
        const { ownerProfile, upgradeProposal, creditCardRewards, projectionYears } = state;
        
        // CC Savings
        const calculatedSavings = (creditCardRewards.estimatedAnnualSpend * creditCardRewards.rewardRate) / 100;

        // Upgrade points
        const totalPointsAfterUpgrade = ownerProfile.currentPoints + upgradeProposal.newPointsAdded + upgradeProposal.convertedDeedsToPoints;
        
        // Financial Projections
        const currentMfInflation = ownerProfile.ownershipType === 'Deeded' ? DEEDED_INFLATION : CLUB_INFLATION;
        const newMfInflation = CLUB_INFLATION; // All new proposals are Club
        
        const costProjectionData = generateCostProjection(
            projectionYears,
            ownerProfile.maintenanceFee, currentMfInflation, ownerProfile.currentLoanBalance, ownerProfile.currentLoanInterestRate, ownerProfile.currentLoanTerm,
            upgradeProposal.projectedMF, newMfInflation, upgradeProposal.newLoanAmount, upgradeProposal.newLoanInterestRate, upgradeProposal.newLoanTerm
        );

        return {
            ...state,
            upgradeProposal: {
                ...state.upgradeProposal,
                totalPointsAfterUpgrade,
            },
            creditCardRewards: {
                ...state.creditCardRewards,
                calculatedSavings,
            },
            costProjectionData
        };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  const calculateVipTiers = useCallback(async () => {
    dispatch({ type: 'SET_IS_CALCULATING', payload: true });
    try {
      const [currentVip, projectedVip] = await Promise.all([
        getVipTier(state.ownerProfile.currentPoints),
        getVipTier(state.upgradeProposal.totalPointsAfterUpgrade || 0)
      ]);
      
      dispatch({ type: 'UPDATE_OWNER_PROFILE', payload: { currentVIPLevel: currentVip.vipTier } });
      dispatch({ type: 'UPDATE_UPGRADE_PROPOSAL', payload: { projectedVIPLevel: projectedVip.vipTier } });

    } catch (error) {
        console.error("Error calculating VIP tiers:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not calculate VIP tiers. Please try again.",
        });
    } finally {
      dispatch({ type: 'SET_IS_CALCULATING', payload: false });
    }
  }, [state.ownerProfile.currentPoints, state.upgradeProposal.totalPointsAfterUpgrade, toast]);


  useEffect(() => {
    dispatch({ type: 'CALCULATE_ALL' });
  }, [state.ownerProfile, state.upgradeProposal, state.creditCardRewards.estimatedAnnualSpend, state.creditCardRewards.rewardRate, state.projectionYears]);

  useEffect(() => {
    if ((state.ownerProfile.currentPoints > 0 || (state.upgradeProposal.totalPointsAfterUpgrade || 0) > 0) && state.upgradeProposal.totalPointsAfterUpgrade !== undefined) {
        calculateVipTiers();
    }
  }, [state.ownerProfile.currentPoints, state.upgradeProposal.totalPointsAfterUpgrade, calculateVipTiers]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

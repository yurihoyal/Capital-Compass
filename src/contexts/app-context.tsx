'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { OwnerProfile, UpgradeProposal, CreditCardRewards, ownershipTypes, redemptionTypes } from '@/types';
import { getVipTier } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { generateCostProjection } from '@/lib/financial';

const DEEDED_INFLATION = 8;
const CLUB_INFLATION = 3;
const POINT_VALUE_FOR_MF_OFFSET = 0.01;

interface AppState {
  ownerProfile: OwnerProfile;
  upgradeProposal: UpgradeProposal;
  creditCardRewards: CreditCardRewards;
  isCalculating: boolean;
  costProjectionData: { year: number, currentCost: number, newCost: number }[];
  projectionYears: 10 | 15 | 20;
  usePointOffset: boolean;
  totalPointsAfterUpgrade: number;
  currentVIPLevel: string;
  projectedVIPLevel: string;
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
  currentLoanTerm: 60, // 5 years in months
  painPoints: [],
};

const initialUpgradeProposal: UpgradeProposal = {
  newPointsAdded: 50000,
  convertedDeedsToPoints: 0,
  newLoanAmount: 25000,
  newLoanTerm: 120, // 10 years in months
  newLoanInterestRate: 7.5,
  projectedMF: 2500,
};

const initialCreditCardRewards: CreditCardRewards = {
  estimatedAnnualSpend: 10000,
  redemptionType: redemptionTypes[0], // Travel
  rewardRate: 1.5,
  calculatedSavings: 0, // will be calculated
};

// Calculate derived initial values
const initialTotalPointsAfterUpgrade = initialOwnerProfile.currentPoints + initialUpgradeProposal.newPointsAdded + initialUpgradeProposal.convertedDeedsToPoints;
const initialCalculatedSavings = (initialCreditCardRewards.estimatedAnnualSpend * initialCreditCardRewards.rewardRate) / 100;

const initialCostProjectionData = generateCostProjection(
    10, // initial projection years
    initialOwnerProfile.maintenanceFee,
    initialOwnerProfile.ownershipType === 'Deeded' ? DEEDED_INFLATION : CLUB_INFLATION,
    initialOwnerProfile.currentLoanBalance,
    initialOwnerProfile.currentLoanInterestRate,
    initialOwnerProfile.currentLoanTerm,
    initialUpgradeProposal.projectedMF,
    CLUB_INFLATION,
    initialUpgradeProposal.newLoanAmount,
    initialUpgradeProposal.newLoanInterestRate,
    initialUpgradeProposal.newLoanTerm,
    0 // initial offset
);

const initialState: AppState = {
  ownerProfile: initialOwnerProfile,
  upgradeProposal: initialUpgradeProposal,
  creditCardRewards: { ...initialCreditCardRewards, calculatedSavings: initialCalculatedSavings },
  isCalculating: false,
  costProjectionData: initialCostProjectionData,
  projectionYears: 10,
  usePointOffset: false,
  totalPointsAfterUpgrade: initialTotalPointsAfterUpgrade,
  currentVIPLevel: 'Preferred',
  projectedVIPLevel: 'Preferred',
};

type Action =
  | { type: 'UPDATE_OWNER_PROFILE'; payload: Partial<OwnerProfile> }
  | { type: 'UPDATE_UPGRADE_PROPOSAL'; payload: Partial<UpgradeProposal> }
  | { type: 'UPDATE_CREDIT_CARD_REWARDS'; payload: Partial<CreditCardRewards> }
  | { type: 'SET_VIP_LEVELS'; payload: { current: string, projected: string } }
  | { type: 'SET_IS_CALCULATING'; payload: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'SET_PROJECTION_YEARS'; payload: 10 | 15 | 20 }
  | { type: 'SET_USE_POINT_OFFSET', payload: boolean }
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
    case 'SET_VIP_LEVELS':
        return { ...state, currentVIPLevel: action.payload.current, projectedVIPLevel: action.payload.projected };
    case 'SET_IS_CALCULATING':
      return { ...state, isCalculating: action.payload };
    case 'RESET_STATE':
        return { ...initialState };
    case 'SET_PROJECTION_YEARS':
        return { ...state, projectionYears: action.payload };
    case 'SET_USE_POINT_OFFSET':
        return { ...state, usePointOffset: action.payload };
    case 'CALCULATE_ALL': {
        const { ownerProfile, upgradeProposal, creditCardRewards, projectionYears, usePointOffset } = state;
        
        const calculatedSavings = (creditCardRewards.estimatedAnnualSpend * creditCardRewards.rewardRate) / 100;
        const totalPointsAfterUpgrade = ownerProfile.currentPoints + upgradeProposal.newPointsAdded + upgradeProposal.convertedDeedsToPoints;
        
        const currentMfInflation = ownerProfile.ownershipType === 'Deeded' ? DEEDED_INFLATION : CLUB_INFLATION;
        const newMfInflation = CLUB_INFLATION;
        
        const annualNewCostOffset = usePointOffset ? (totalPointsAfterUpgrade * 0.5 * POINT_VALUE_FOR_MF_OFFSET) : 0;
        
        const costProjectionData = generateCostProjection(
            projectionYears,
            ownerProfile.maintenanceFee, currentMfInflation, ownerProfile.currentLoanBalance, ownerProfile.currentLoanInterestRate, ownerProfile.currentLoanTerm,
            upgradeProposal.projectedMF, newMfInflation, upgradeProposal.newLoanAmount, upgradeProposal.newLoanInterestRate, upgradeProposal.newLoanTerm,
            annualNewCostOffset
        );

        return {
            ...state,
            totalPointsAfterUpgrade,
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
    if (state.totalPointsAfterUpgrade === undefined) return;
    dispatch({ type: 'SET_IS_CALCULATING', payload: true });
    try {
      const [currentVip, projectedVip] = await Promise.all([
        getVipTier(state.ownerProfile.currentPoints),
        getVipTier(state.totalPointsAfterUpgrade)
      ]);
      
      dispatch({ type: 'SET_VIP_LEVELS', payload: { current: currentVip.vipTier, projected: projectedVip.vipTier } });

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
  }, [state.ownerProfile.currentPoints, state.totalPointsAfterUpgrade, toast]);


  const { 
    ownerProfile: {
      currentPoints, ownershipType, maintenanceFee, currentLoanBalance, currentLoanInterestRate, currentLoanTerm
    },
    upgradeProposal: {
      newPointsAdded, convertedDeedsToPoints, projectedMF, newLoanAmount, newLoanTerm, newLoanInterestRate
    },
    creditCardRewards: {
      estimatedAnnualSpend, rewardRate
    },
    projectionYears,
    usePointOffset
  } = state;

  useEffect(() => {
    dispatch({ type: 'CALCULATE_ALL' });
  }, [
    currentPoints, ownershipType, maintenanceFee, currentLoanBalance, currentLoanInterestRate, currentLoanTerm,
    newPointsAdded, convertedDeedsToPoints, projectedMF, newLoanAmount, newLoanTerm, newLoanInterestRate,
    estimatedAnnualSpend, rewardRate, 
    projectionYears,
    usePointOffset,
    dispatch
  ]);

  useEffect(() => {
    calculateVipTiers();
  }, [calculateVipTiers]);

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

'use client';

import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { OwnerProfile, UpgradeProposal, RewardsCalculatorData, TravelServicesCalculatorData } from '@/types';
import { generateCostProjection, generateCurrentPathProjection } from '@/lib/financial';

const POINT_VALUE_FOR_MF_OFFSET = 0.01;

const getVipTierFromPoints = (points: number): string => {
    if (points >= 1000000) return 'Platinum';
    if (points >= 500000) return 'Gold';
    if (points >= 300000) return 'Silver';
    return 'Preferred';
};

interface AppState {
  ownerProfile: OwnerProfile;
  upgradeProposal: UpgradeProposal;
  rewardsCalculator: RewardsCalculatorData;
  travelServicesCalculator: TravelServicesCalculatorData;
  projectionYears: 10 | 15 | 20;
  usePointOffset: boolean;
}

// This interface includes the calculated values
interface FullAppState extends AppState {
  costProjectionData: { year: number, currentCost: number, newCost: number }[];
  currentPathProjection: { year: number; maintenanceFees: number; loanPayments: number; monthlyMf: number; monthlyLoan: number; cumulativeCost: number; }[];
  currentPathSummary: { totalCost: number; totalMf: number; totalLoanPaid: number; };
  totalPointsAfterUpgrade: number;
  currentVIPLevel: string;
  projectedVIPLevel: string;
}

const initialCoreState: AppState = {
  ownerProfile: {
    ownerName: 'John & Jane Smith',
    ownerId: '123456',
    ownershipType: 'Deeded Only',
    deedPointValue: 150000,
    currentPoints: 0,
    maintenanceFee: 167,
    specialAssessment: 0,
    currentMonthlyLoanPayment: 250,
    currentLoanTerm: 60,
    mfInflationRate: 8,
  },
  upgradeProposal: {
    newPointsAdded: 150000,
    convertedDeedsToPoints: 0,
    newMonthlyLoanPayment: 350,
    newLoanTerm: 120,
    newLoanInterestRate: 7.5,
    projectedMF: 208,
    newMfInflationRate: 3,
  },
  rewardsCalculator: {
      monthlySpend: 1500,
  },
  travelServicesCalculator: {
      pointsForTravel: 0,
  },
  projectionYears: 10,
  usePointOffset: false,
};


type Action =
  | { type: 'UPDATE_OWNER_PROFILE'; payload: Partial<OwnerProfile> }
  | { type: 'UPDATE_UPGRADE_PROPOSAL'; payload: Partial<UpgradeProposal> }
  | { type: 'UPDATE_REWARDS_CALCULATOR'; payload: Partial<RewardsCalculatorData> }
  | { type: 'UPDATE_TRAVEL_SERVICES_CALCULATOR'; payload: Partial<TravelServicesCalculatorData> }
  | { type: 'RESET_STATE' }
  | { type: 'SET_PROJECTION_YEARS'; payload: 10 | 15 | 20 }
  | { type: 'SET_USE_POINT_OFFSET', payload: boolean };


const AppContext = createContext<{ state: FullAppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_OWNER_PROFILE':
      return { ...state, ownerProfile: { ...state.ownerProfile, ...action.payload } };
    case 'UPDATE_UPGRADE_PROPOSAL':
      return { ...state, upgradeProposal: { ...state.upgradeProposal, ...action.payload } };
    case 'UPDATE_REWARDS_CALCULATOR':
        return { ...state, rewardsCalculator: { ...state.rewardsCalculator, ...action.payload } };
    case 'UPDATE_TRAVEL_SERVICES_CALCULATOR':
        return { ...state, travelServicesCalculator: { ...state.travelServicesCalculator, ...action.payload } };
    case 'RESET_STATE':
        return { ...initialCoreState };
    case 'SET_PROJECTION_YEARS':
        return { ...state, projectionYears: action.payload };
    case 'SET_USE_POINT_OFFSET':
        return { ...state, usePointOffset: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialCoreState);

  const { 
    ownerProfile,
    upgradeProposal,
    rewardsCalculator,
    travelServicesCalculator,
    projectionYears,
    usePointOffset
  } = state;

  const calculatedState = useMemo(() => {
    // --- Rewards Calculation ---
    const { monthlySpend } = rewardsCalculator;
    const totalRewards = (monthlySpend || 0) * 12 * 3;
    const annualCredit = totalRewards * 0.05;
    const monthlyCredit = annualCredit / 12;
    const calculatedRewards: RewardsCalculatorData = { ...rewardsCalculator, totalRewards, annualCredit, monthlyCredit };

    // --- Travel Services Calculation ---
    const { pointsForTravel } = travelServicesCalculator;
    const cashValueOfPoints = (pointsForTravel || 0) * 0.02;
    const calculatedTravelServices: TravelServicesCalculatorData = { ...travelServicesCalculator, cashValueOfPoints };
    
    // --- Points and Projections ---
    const isClubMember = ownerProfile.ownershipType === 'Capital Club Member';

    // For existing Club members, their current points are their base. Deeded owners aren't in the club yet.
    const currentPoints = isClubMember ? (ownerProfile.currentPoints || 0) : 0;
    
    // Calculate total points after the upgrade proposal.
    let totalPointsAfterUpgrade;
    if (isClubMember) {
        // For Club Members, the new total is their current points plus newly added points.
        // This fixes a bug where string concatenation was occurring instead of numeric addition.
        totalPointsAfterUpgrade = Number(currentPoints) + Number(upgradeProposal.newPointsAdded || 0);
    } else {
        // For Deeded Owners, the new total is their deed's value (converted to points) plus newly added points.
        totalPointsAfterUpgrade = Number(ownerProfile.deedPointValue || 0) + Number(upgradeProposal.newPointsAdded || 0);
    }
    
    const pointOffsetCredit = usePointOffset ? (totalPointsAfterUpgrade * 0.5 * POINT_VALUE_FOR_MF_OFFSET) : 0;
    let totalAnnualOffset = pointOffsetCredit + (calculatedRewards.annualCredit || 0);

    const costProjectionData = generateCostProjection(
        projectionYears,
        (ownerProfile.maintenanceFee || 0) * 12, ownerProfile.mfInflationRate, ownerProfile.specialAssessment,
        ownerProfile.currentMonthlyLoanPayment || 0, ownerProfile.currentLoanTerm || 0,
        (upgradeProposal.projectedMF || 0) * 12, upgradeProposal.newMfInflationRate, 
        upgradeProposal.newMonthlyLoanPayment || 0, 
        upgradeProposal.newLoanTerm,
        totalAnnualOffset
    );

    const currentPathData = generateCurrentPathProjection(
        projectionYears,
        (ownerProfile.maintenanceFee || 0) * 12, ownerProfile.mfInflationRate, ownerProfile.specialAssessment,
        ownerProfile.currentMonthlyLoanPayment || 0, ownerProfile.currentLoanTerm || 0
    );

    const currentVIPLevel = isClubMember ? getVipTierFromPoints(currentPoints) : 'Deeded';
    const projectedVIPLevel = getVipTierFromPoints(totalPointsAfterUpgrade);

    return {
      totalPointsAfterUpgrade,
      rewardsCalculator: calculatedRewards,
      travelServicesCalculator: calculatedTravelServices,
      costProjectionData,
      currentPathProjection: currentPathData.projection,
      currentPathSummary: currentPathData.summary,
      currentVIPLevel,
      projectedVIPLevel
    };
  }, [ownerProfile, upgradeProposal, rewardsCalculator, travelServicesCalculator, projectionYears, usePointOffset]);


  const fullState: FullAppState = {
    ...state,
    ...calculatedState,
  };

  return (
    <AppContext.Provider value={{ state: fullState, dispatch }}>
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

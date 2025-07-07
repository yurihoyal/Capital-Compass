'use client';

import React, { createContext, useContext, useReducer, useMemo, useState, useEffect } from 'react';
import { OwnerProfile, UpgradeProposal, RewardsCalculatorData, TravelServicesCalculatorData } from '@/types';
import { generateCostProjection, generateCurrentPathProjection } from '@/lib/financial';

const POINT_VALUE_FOR_MF_OFFSET = 0.01;

const getVipTierFromPoints = (points: number): string => {
    if (points >= 1000000) return 'Platinum';
    if (points >= 500000) return 'Gold';
    if (points >= 300000) return 'Silver';
    return 'Preferred';
};

// --- START: Centralized Calculation Constants ---
interface PerkValues {
    bookingWindow: number;
    unitUpgrades: number;
    goWeeks: number;
    flexAccess: number;
    guestCerts: number;
    aspireBanking: number;
    exclusiveServices: number;
}
type Tier = 'Deeded' | 'Preferred' | 'Silver' | 'Gold' | 'Platinum' | string;

const tierValueMap: Record<Tier, PerkValues> = {
    Deeded:           { bookingWindow: 0,      unitUpgrades: 0,   goWeeks: 0,     flexAccess: 0,    guestCerts: 0,  aspireBanking: 0,   exclusiveServices: 0 },
    Preferred:        { bookingWindow: 150*10, unitUpgrades: 0,   goWeeks: 200,   flexAccess: 50*1, guestCerts: 30, aspireBanking: 0,   exclusiveServices: 0 },
    Silver:           { bookingWindow: 150*11, unitUpgrades: 0,   goWeeks: 400,   flexAccess: 50*2, guestCerts: 60, aspireBanking: 50,  exclusiveServices: 0 },
    Gold:             { bookingWindow: 150*12, unitUpgrades: 375, goWeeks: 600,   flexAccess: 50*4, guestCerts: 90, aspireBanking: 100, exclusiveServices: 400 },
    Platinum:         { bookingWindow: 150*13, unitUpgrades: 500, goWeeks: 1000,  flexAccess: 50*6, guestCerts: 120,aspireBanking: 150, exclusiveServices: 800 },
};

const ownerAssistanceRateMap: Record<string, number> = {
    Platinum: 0.0045,
    Gold: 0.0042,
    Silver: 0.0039,
    Preferred: 0.0036,
};
const defaultOwnerAssistanceRate = 0.0033;
// --- END: Centralized Calculation Constants ---


interface AppState {
  ownerProfile: OwnerProfile;
  upgradeProposal: UpgradeProposal;
  rewardsCalculator: RewardsCalculatorData;
  travelServicesCalculator: TravelServicesCalculatorData;
  projectionYears: 10 | 15 | 20;
  usePointOffset: boolean;
  useRewardsOffset: boolean;
  useTravelOffset: boolean;
  useOwnerAssistanceOffset: boolean;
  showAiSummary: boolean;
  rewardsSpendHasBeenManuallySet: boolean;
}

type ProjectionData = { year: number, maintenanceFees: number, loanPayments: number, monthlyMf: number, monthlyLoan: number, cumulativeCost: number };
type SummaryData = { totalCost: number, totalMf: number, totalLoanPaid: number };

// This interface includes the calculated values
interface FullAppState extends AppState {
  isClubMember: boolean;
  costProjectionData: { year: number, currentCost: number, newCost: number }[];
  currentPathProjection: ProjectionData[];
  currentPathSummary: SummaryData;
  newPathProjection: ProjectionData[];
  newPathSummary: SummaryData;
  totalPointsAfterUpgrade: number;
  currentVIPLevel: string;
  projectedVIPLevel: string;
  annualVipValueGained: number;
  ownerAssistancePayout: number;
  totalAnnualPotential: number;
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
    totalAmountFinanced: 20000,
    newMonthlyLoanPayment: 250,
    newLoanTerm: 120,
    projectedMF: 208,
    newMfInflationRate: 3,
  },
  rewardsCalculator: {
      monthlySpend: 2000,
  },
  travelServicesCalculator: {
      pointsForTravel: 200000,
  },
  projectionYears: 10,
  usePointOffset: false, // Legacy, can be removed if not used elsewhere
  useRewardsOffset: true,
  useTravelOffset: true,
  useOwnerAssistanceOffset: true,
  showAiSummary: true,
  rewardsSpendHasBeenManuallySet: false,
};


type Action =
  | { type: 'UPDATE_OWNER_PROFILE'; payload: Partial<OwnerProfile> }
  | { type: 'UPDATE_UPGRADE_PROPOSAL'; payload: Partial<UpgradeProposal> }
  | { type: 'UPDATE_REWARDS_CALCULATOR'; payload: Partial<RewardsCalculatorData> }
  | { type: 'UPDATE_TRAVEL_SERVICES_CALCULATOR'; payload: Partial<TravelServicesCalculatorData> }
  | { type: 'RESET_STATE' }
  | { type: 'SET_PROJECTION_YEARS'; payload: 10 | 15 | 20 }
  | { type: 'SET_USE_REWARDS_OFFSET', payload: boolean }
  | { type: 'SET_USE_TRAVEL_OFFSET', payload: boolean }
  | { type: 'SET_USE_OWNER_ASSISTANCE_OFFSET', payload: boolean }
  | { type: 'SET_SHOW_AI_SUMMARY', payload: boolean }
  | { type: 'SET_REWARDS_SPEND_MANUALLY_SET', payload: boolean };


const AppContext = createContext<{ state: FullAppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_OWNER_PROFILE':
      return { ...state, ownerProfile: { ...state.ownerProfile, ...action.payload } };
    case 'UPDATE_UPGRADE_PROPOSAL':
       // When proposal changes, if spend hasn't been manually set, allow it to be auto-updated.
       const newMonthlyTotal = (action.payload.projectedMF || state.upgradeProposal.projectedMF || 0) + (action.payload.newMonthlyLoanPayment || state.upgradeProposal.newMonthlyLoanPayment || 0);
       return { 
           ...state, 
           upgradeProposal: { ...state.upgradeProposal, ...action.payload },
           rewardsCalculator: state.rewardsSpendHasBeenManuallySet 
               ? state.rewardsCalculator 
               : { ...state.rewardsCalculator, monthlySpend: newMonthlyTotal }
       };
    case 'UPDATE_REWARDS_CALCULATOR':
        return { ...state, rewardsCalculator: { ...state.rewardsCalculator, ...action.payload } };
    case 'SET_REWARDS_SPEND_MANUALLY_SET':
        return { ...state, rewardsSpendHasBeenManuallySet: action.payload };
    case 'UPDATE_TRAVEL_SERVICES_CALCULATOR':
        return { ...state, travelServicesCalculator: { ...state.travelServicesCalculator, ...action.payload } };
    case 'RESET_STATE':
        return { ...initialCoreState };
    case 'SET_PROJECTION_YEARS':
        return { ...state, projectionYears: action.payload };
    case 'SET_USE_REWARDS_OFFSET':
        return { ...state, useRewardsOffset: action.payload };
    case 'SET_USE_TRAVEL_OFFSET':
        return { ...state, useTravelOffset: action.payload };
    case 'SET_USE_OWNER_ASSISTANCE_OFFSET':
        return { ...state, useOwnerAssistanceOffset: action.payload };
    case 'SET_SHOW_AI_SUMMARY':
        return { ...state, showAiSummary: action.payload };
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
    useRewardsOffset,
    useTravelOffset,
    useOwnerAssistanceOffset,
  } = state;

  const calculatedState = useMemo(() => {
    // --- Rewards Calculation ---
    const { monthlySpend } = rewardsCalculator;
    const annualSpend = (monthlySpend || 0) * 12;
    const annualPoints = annualSpend * 6;
    const redemptionBonusPoints = annualPoints * 0.05;
    const totalRedeemablePoints = annualPoints + redemptionBonusPoints;
    const annualCredit = totalRedeemablePoints * 0.01;
    const monthlyCredit = annualCredit / 12;
    const calculatedRewards: RewardsCalculatorData = { 
        ...rewardsCalculator, 
        totalRewards: totalRedeemablePoints, 
        annualCredit, 
        monthlyCredit 
    };

    // --- Travel Services Calculation ---
    const { pointsForTravel } = travelServicesCalculator;
    const cashValueOfPoints = (pointsForTravel || 0) * 0.02;
    const calculatedTravelServices: TravelServicesCalculatorData = { ...travelServicesCalculator, cashValueOfPoints };
    
    // --- Points ---
    const isClubMember = ownerProfile.ownershipType === 'Capital Club Member';
    const currentPoints = isClubMember ? (ownerProfile.currentPoints || 0) : 0;
    
    let totalPointsAfterUpgrade;
    if (isClubMember) {
        totalPointsAfterUpgrade = Number(ownerProfile.currentPoints || 0) + Number(upgradeProposal.newPointsAdded || 0);
    } else {
        totalPointsAfterUpgrade = Number(ownerProfile.deedPointValue || 0) + Number(upgradeProposal.newPointsAdded || 0);
    }
    
    // --- VIP & Assistance Payout ---
    const currentVIPLevel = isClubMember ? getVipTierFromPoints(currentPoints) : 'Deeded';
    const projectedVIPLevel = getVipTierFromPoints(totalPointsAfterUpgrade);
    const eligiblePointsForAssistance = (totalPointsAfterUpgrade || 0) * 0.5;
    const assistanceRate = ownerAssistanceRateMap[projectedVIPLevel] || defaultOwnerAssistanceRate;
    const ownerAssistancePayout = projectedVIPLevel === 'Deeded' ? 0 : eligiblePointsForAssistance * assistanceRate;

    // --- VIP Value Gained ---
    const currentPerks = tierValueMap[currentVIPLevel] ?? tierValueMap.Deeded;
    const newPerks = tierValueMap[projectedVIPLevel] ?? tierValueMap.Deeded;
    const getPerkValue = (perks: PerkValues) => Object.values(perks).reduce((sum, val) => sum + val, 0);
    const currentValue = getPerkValue(currentPerks);
    const newValue = getPerkValue(newPerks);
    const annualVipValueGained = Math.max(0, newValue - currentValue);
    const totalAnnualPotential = annualVipValueGained + (calculatedRewards.annualCredit || 0) + (calculatedTravelServices.cashValueOfPoints || 0) + ownerAssistancePayout;

    // --- Cost Projections ---
    // Calculate total annual offset based on toggles
    let annualNewCostOffset = 0;
    if (useRewardsOffset) annualNewCostOffset += calculatedRewards.annualCredit || 0;
    if (useTravelOffset) annualNewCostOffset += calculatedTravelServices.cashValueOfPoints || 0;
    if (useOwnerAssistanceOffset) annualNewCostOffset += ownerAssistancePayout || 0;

    const principalOnlyMonthlyPayment = (upgradeProposal.totalAmountFinanced && upgradeProposal.newLoanTerm)
        ? (upgradeProposal.totalAmountFinanced / upgradeProposal.newLoanTerm)
        : 0;

    const costProjectionData = generateCostProjection(
        projectionYears,
        (ownerProfile.maintenanceFee || 0) * 12, ownerProfile.mfInflationRate, ownerProfile.specialAssessment,
        Number(ownerProfile.currentMonthlyLoanPayment) || 0, Number(ownerProfile.currentLoanTerm) || 0,
        (upgradeProposal.projectedMF || 0) * 12, upgradeProposal.newMfInflationRate, 
        principalOnlyMonthlyPayment,
        upgradeProposal.newLoanTerm,
        annualNewCostOffset
    );

     const { projection: currentPathProjection, summary: currentPathSummary } = generateCurrentPathProjection(
        projectionYears,
        (ownerProfile.maintenanceFee || 0) * 12,
        ownerProfile.mfInflationRate,
        ownerProfile.specialAssessment || 0,
        Number(ownerProfile.currentMonthlyLoanPayment) || 0,
        Number(ownerProfile.currentLoanTerm) || 0,
        0 // No offset for current path
    );

    const { projection: newPathProjection, summary: newPathSummary } = generateCurrentPathProjection(
        projectionYears,
        (upgradeProposal.projectedMF || 0) * 12,
        upgradeProposal.newMfInflationRate,
        0, // No special assessment for new path
        principalOnlyMonthlyPayment,
        upgradeProposal.newLoanTerm,
        annualNewCostOffset
    );

    return {
      isClubMember,
      totalPointsAfterUpgrade,
      rewardsCalculator: calculatedRewards,
      travelServicesCalculator: calculatedTravelServices,
      costProjectionData,
      currentPathProjection,
      currentPathSummary,
      newPathProjection,
      newPathSummary,
      currentVIPLevel,
      projectedVIPLevel,
      annualVipValueGained,
      ownerAssistancePayout,
      totalAnnualPotential,
    };
  }, [ownerProfile, upgradeProposal, rewardsCalculator, travelServicesCalculator, projectionYears, useRewardsOffset, useTravelOffset, useOwnerAssistanceOffset]);


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

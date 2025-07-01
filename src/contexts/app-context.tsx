'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { OwnerProfile, UpgradeProposal, RewardsCalculatorData, TravelServicesCalculatorData } from '@/types';
import { generateCostProjection, generateCurrentPathProjection } from '@/lib/financial';

const DEEDED_INFLATION = 8;
const CLUB_INFLATION = 3;
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
  costProjectionData: { year: number, currentCost: number, newCost: number }[];
  currentPathProjection: { year: number, cumulativeCost: number }[];
  currentPathSummary: { totalCost: number; totalInterest: number; totalMf: number; };
  projectionYears: 10 | 15 | 20;
  usePointOffset: boolean;
  totalPointsAfterUpgrade: number;
  currentVIPLevel: string;
  projectedVIPLevel: string;
}

const initialOwnerProfile: OwnerProfile = {
  ownerName: 'John & Jane Smith',
  ownerId: '123456',
  ownershipType: 'Deeded Only',
  deedPointValue: 150000,
  currentPoints: 0,
  maintenanceFee: 2000,
  specialAssessment: 0,
  currentLoanBalance: 10000,
  currentLoanInterestRate: 8.5,
  currentLoanTerm: 60,
  mfInflationRate: 8,
};

const initialUpgradeProposal: UpgradeProposal = {
  newPointsAdded: 150000,
  convertedDeedsToPoints: 0,
  newLoanAmount: 25000,
  newLoanTerm: 120,
  newLoanInterestRate: 7.5,
  projectedMF: 2500,
  newMfInflationRate: 3,
};

const initialRewardsCalculator: RewardsCalculatorData = {
    monthlySpend: 1500,
    totalRewards: 0,
    annualCredit: 0,
    monthlyCredit: 0,
};

const initialTravelServicesCalculator: TravelServicesCalculatorData = {
    pointsForTravel: 0,
    outOfPocketSpend: 0,
    applyToProjection: false,
    cashValueOfPoints: 0,
    estimatedSavings: 0,
};

// Calculate derived initial values
const initialStartingPoints = initialOwnerProfile.ownershipType === 'Deeded Only'
    ? (initialOwnerProfile.deedPointValue || 0)
    : (initialOwnerProfile.currentPoints || 0);

const initialTotalPointsAfterUpgrade = initialStartingPoints + initialUpgradeProposal.newPointsAdded + initialUpgradeProposal.convertedDeedsToPoints;
const initialCurrentPathData = generateCurrentPathProjection(10, initialOwnerProfile.maintenanceFee, initialOwnerProfile.mfInflationRate, initialOwnerProfile.specialAssessment, initialOwnerProfile.currentLoanBalance, initialOwnerProfile.currentLoanInterestRate, initialOwnerProfile.currentLoanTerm);

const initialCostProjectionData = generateCostProjection(
    10,
    initialOwnerProfile.maintenanceFee,
    initialOwnerProfile.mfInflationRate,
    initialOwnerProfile.specialAssessment,
    initialOwnerProfile.currentLoanBalance,
    initialOwnerProfile.currentLoanInterestRate,
    initialOwnerProfile.currentLoanTerm,
    initialUpgradeProposal.projectedMF,
    initialUpgradeProposal.newMfInflationRate,
    initialUpgradeProposal.newLoanAmount,
    initialUpgradeProposal.newLoanInterestRate,
    initialUpgradeProposal.newLoanTerm,
    0
);

const initialState: AppState = {
  ownerProfile: initialOwnerProfile,
  upgradeProposal: initialUpgradeProposal,
  rewardsCalculator: initialRewardsCalculator,
  travelServicesCalculator: initialTravelServicesCalculator,
  costProjectionData: initialCostProjectionData,
  currentPathProjection: initialCurrentPathData.projection,
  currentPathSummary: initialCurrentPathData.summary,
  projectionYears: 10,
  usePointOffset: false,
  totalPointsAfterUpgrade: initialTotalPointsAfterUpgrade,
  currentVIPLevel: getVipTierFromPoints(initialStartingPoints),
  projectedVIPLevel: getVipTierFromPoints(initialTotalPointsAfterUpgrade),
};

type Action =
  | { type: 'UPDATE_OWNER_PROFILE'; payload: Partial<OwnerProfile> }
  | { type: 'UPDATE_UPGRADE_PROPOSAL'; payload: Partial<UpgradeProposal> }
  | { type: 'UPDATE_REWARDS_CALCULATOR'; payload: Partial<RewardsCalculatorData> }
  | { type: 'UPDATE_TRAVEL_SERVICES_CALCULATOR'; payload: Partial<TravelServicesCalculatorData> }
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
    case 'UPDATE_REWARDS_CALCULATOR':
        return { ...state, rewardsCalculator: { ...state.rewardsCalculator, ...action.payload } };
    case 'UPDATE_TRAVEL_SERVICES_CALCULATOR':
        return { ...state, travelServicesCalculator: { ...state.travelServicesCalculator, ...action.payload } };
    case 'RESET_STATE':
        return { ...initialState };
    case 'SET_PROJECTION_YEARS':
        return { ...state, projectionYears: action.payload };
    case 'SET_USE_POINT_OFFSET':
        return { ...state, usePointOffset: action.payload };
    case 'CALCULATE_ALL': {
        const { ownerProfile, upgradeProposal, rewardsCalculator, travelServicesCalculator, projectionYears, usePointOffset } = state;
        
        // --- Rewards Calculation ---
        const { monthlySpend } = rewardsCalculator;
        const totalRewards = (monthlySpend || 0) * 12 * 3;
        const annualCredit = totalRewards * 0.05;
        const monthlyCredit = annualCredit / 12;
        const calculatedRewards: RewardsCalculatorData = { ...rewardsCalculator, totalRewards, annualCredit, monthlyCredit };
        // --- End Rewards Calculation ---

        // --- Travel Services Calculation ---
        const { pointsForTravel, outOfPocketSpend, applyToProjection } = travelServicesCalculator;
        const cashValueOfPoints = (pointsForTravel || 0) * 0.02;
        const estimatedSavings = Math.max(0, (outOfPocketSpend || 0) - cashValueOfPoints);
        const calculatedTravelServices: TravelServicesCalculatorData = { ...travelServicesCalculator, cashValueOfPoints, estimatedSavings };
        // --- End Travel Services Calculation ---

        const startingPoints = ownerProfile.ownershipType === 'Deeded Only'
            ? (ownerProfile.deedPointValue || 0)
            : (ownerProfile.currentPoints || 0);
        
        const newPointsFromDeeds = ownerProfile.ownershipType === 'Capital Club Member' ? (upgradeProposal.convertedDeedsToPoints || 0) : 0;
        const totalPointsAfterUpgrade = startingPoints + (upgradeProposal.newPointsAdded || 0) + newPointsFromDeeds;
        
        const pointOffsetCredit = usePointOffset ? (totalPointsAfterUpgrade * 0.5 * POINT_VALUE_FOR_MF_OFFSET) : 0;
        let totalAnnualOffset = pointOffsetCredit + annualCredit;

        if (applyToProjection) {
            totalAnnualOffset += estimatedSavings;
        }
        
        const costProjectionData = generateCostProjection(
            projectionYears,
            ownerProfile.maintenanceFee, ownerProfile.mfInflationRate, ownerProfile.specialAssessment, ownerProfile.currentLoanBalance, ownerProfile.currentLoanInterestRate, ownerProfile.currentLoanTerm,
            upgradeProposal.projectedMF, upgradeProposal.newMfInflationRate, upgradeProposal.newLoanAmount, upgradeProposal.newLoanInterestRate, upgradeProposal.newLoanTerm,
            totalAnnualOffset
        );

        const currentPathData = generateCurrentPathProjection(
            projectionYears,
            ownerProfile.maintenanceFee, ownerProfile.mfInflationRate, ownerProfile.specialAssessment, ownerProfile.currentLoanBalance, ownerProfile.currentLoanInterestRate, ownerProfile.currentLoanTerm
        );

        const currentVIPLevel = ownerProfile.ownershipType === 'Deeded Only' ? 'Deeded' : getVipTierFromPoints(startingPoints);
        const projectedVIPLevel = getVipTierFromPoints(totalPointsAfterUpgrade);

        return {
            ...state,
            totalPointsAfterUpgrade,
            rewardsCalculator: calculatedRewards,
            travelServicesCalculator: calculatedTravelServices,
            costProjectionData,
            currentPathProjection: currentPathData.projection,
            currentPathSummary: currentPathData.summary,
            currentVIPLevel,
            projectedVIPLevel
        };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const { 
    ownerProfile,
    upgradeProposal,
    rewardsCalculator,
    travelServicesCalculator,
    projectionYears,
    usePointOffset
  } = state;

  useEffect(() => {
    dispatch({ type: 'CALCULATE_ALL' });
  }, [
    ownerProfile,
    upgradeProposal,
    rewardsCalculator,
    travelServicesCalculator,
    projectionYears,
    usePointOffset,
    dispatch
  ]);

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

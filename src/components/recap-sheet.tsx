'use client';
import React, { useMemo } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';
import { Separator } from './ui/separator';
import { generateCostProjection } from '@/lib/financial';

const POINT_VALUE_FOR_MF_OFFSET = 0.01;

const RecapSheet = () => {
    const { state } = useAppContext();
    const { 
        ownerProfile, 
        upgradeProposal, 
        rewardsCalculator, 
        currentVIPLevel, 
        projectedVIPLevel, 
        totalPointsAfterUpgrade, 
        usePointOffset 
    } = state;

    const handlePrint = () => {
        window.print();
    };

    // The costProjectionData from context is dependent on the selected projection years (10, 15, 20).
    // The recap sheet always needs 10 and 20-year savings data, so we recalculate it here.
    const recapProjectionData = useMemo(() => {
        // This logic mirrors the offset calculation in app-context.tsx to ensure consistency.
        const pointOffsetCredit = usePointOffset ? (totalPointsAfterUpgrade * 0.5 * POINT_VALUE_FOR_MF_OFFSET) : 0;
        const creditCardAnnualOffset = rewardsCalculator.annualCredit || 0;
        const totalAnnualOffset = pointOffsetCredit + creditCardAnnualOffset;
        const principalOnlyMonthlyPayment = (upgradeProposal.totalAmountFinanced && upgradeProposal.newLoanTerm)
            ? (upgradeProposal.totalAmountFinanced / upgradeProposal.newLoanTerm)
            : 0;

        return generateCostProjection(
            20, // Always calculate for 20 years for the recap sheet
            (ownerProfile.maintenanceFee || 0) * 12,
            ownerProfile.mfInflationRate,
            ownerProfile.specialAssessment || 0,
            Number(ownerProfile.currentMonthlyLoanPayment) || 0,
            Number(ownerProfile.currentLoanTerm) || 0,
            (upgradeProposal.projectedMF || 0) * 12,
            upgradeProposal.newMfInflationRate,
            principalOnlyMonthlyPayment,
            upgradeProposal.newLoanTerm,
            totalAnnualOffset
        );
    }, [ownerProfile, upgradeProposal, rewardsCalculator, totalPointsAfterUpgrade, usePointOffset]);

    const costDifference10Years = (recapProjectionData.find(d => d.year === 10)?.currentCost || 0) - (recapProjectionData.find(d => d.year === 10)?.newCost || 0);
    const costDifference20Years = (recapProjectionData.find(d => d.year === 20)?.currentCost || 0) - (recapProjectionData.find(d => d.year === 20)?.newCost || 0);

    return (
        <>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
                }
                `}
            </style>
            <div className="flex justify-end mb-4 no-print">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Recap
                </Button>
            </div>
            <div className="printable-area">
                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-3xl">Capital Compass Proposal</CardTitle>
                        <CardDescription className="text-lg">For: {ownerProfile.ownerName || 'Valued Owner'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-headline text-2xl border-b pb-2">Current Ownership</h3>
                                <p><strong>VIP Tier:</strong> {currentVIPLevel}</p>
                                <p><strong>Points:</strong> {ownerProfile.currentPoints.toLocaleString()}</p>
                                <p><strong>Ownership Type:</strong> {ownerProfile.ownershipType}</p>
                                <p><strong>Exit Strategy:</strong> {ownerProfile.ownershipType === 'Deeded Only' ? 'In Perpetuity' : 'Flexible'}</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-headline text-2xl border-b pb-2 text-primary">New Proposal</h3>
                                <p><strong>Projected VIP Tier:</strong> {projectedVIPLevel}</p>
                                <p><strong>Total Points:</strong> {(totalPointsAfterUpgrade || 0).toLocaleString()}</p>
                                <p><strong>Ownership Type:</strong> Club</p>
                                <p><strong>Exit Strategy:</strong> Flexible</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-headline text-2xl text-center">Financial Summary</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-center">
                                    <p className="text-muted-foreground">10-Year Savings with Restructure</p>
                                    <p className="text-4xl font-bold text-success">${costDifference10Years.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                 <div className="text-center">
                                    <p className="text-muted-foreground">20-Year Savings with Restructure</p>
                                    <p className="text-4xl font-bold text-success">${costDifference20Years.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                             <p className="text-center text-muted-foreground pt-2">Includes projected MF inflation and credit card rewards of an estimated ${ (rewardsCalculator.annualCredit || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}/year.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full mt-8 p-4 border-t">
                            <p className="text-sm text-center italic mb-8">
                                “I understand the value of enrolling into the Capital Club and accept the advantages presented.”
                            </p>
                            <div className="grid grid-cols-2 gap-16">
                                <div className="border-b border-foreground"></div>
                                <div className="border-b border-foreground"></div>
                                <p className="text-center font-medium">Signature</p>
                                <p className="text-center font-medium">Date</p>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};

export default RecapSheet;

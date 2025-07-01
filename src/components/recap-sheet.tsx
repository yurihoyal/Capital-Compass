'use client';
import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';
import { Separator } from './ui/separator';

const RecapSheet = () => {
    const { state } = useAppContext();
    const { ownerProfile, rewardsCalculator, costProjectionData, currentVIPLevel, projectedVIPLevel, totalPointsAfterUpgrade } = state;

    const handlePrint = () => {
        window.print();
    };

    const costDifference10Years = (costProjectionData.find(d => d.year === 10)?.currentCost || 0) - (costProjectionData.find(d => d.year === 10)?.newCost || 0);
    const costDifference20Years = (costProjectionData.find(d => d.year === 20)?.currentCost || 0) - (costProjectionData.find(d => d.year === 20)?.newCost || 0);

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
                        <CardTitle className="font-headline text-3xl">Capital Closer Proposal</CardTitle>
                        <CardDescription className="text-lg">For: {ownerProfile.ownerName || 'Valued Owner'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-headline text-2xl border-b pb-2">Current Ownership</h3>
                                <p><strong>VIP Tier:</strong> {currentVIPLevel}</p>
                                <p><strong>Points:</strong> {ownerProfile.currentPoints.toLocaleString()}</p>
                                <p><strong>Ownership Type:</strong> {ownerProfile.ownershipType}</p>
                                <p><strong>Exit Strategy:</strong> {ownerProfile.ownershipType === 'Deeded' ? 'In Perpetuity' : 'Flexible'}</p>
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
                                    <p className="text-muted-foreground">10-Year Savings with Upgrade</p>
                                    <p className="text-4xl font-bold text-success">${costDifference10Years.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                 <div className="text-center">
                                    <p className="text-muted-foreground">20-Year Savings with Upgrade</p>
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

    
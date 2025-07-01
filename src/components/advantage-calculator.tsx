// @ts-nocheck
'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from './ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from './ui/badge';
import { calculateMonthlyPayment } from '@/lib/financial';
import { Flame, Sparkles } from 'lucide-react';

const chartConfig = {
  currentCost: {
    label: "Current Path Cost",
    color: "hsl(var(--destructive))",
  },
  newCost: {
    label: "Upgrade Path Cost",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


const AdvantageCalculator = () => {
    const { state, dispatch } = useAppContext();
    const { ownerProfile, upgradeProposal, costProjectionData, projectionYears, usePointOffset, totalPointsAfterUpgrade, currentVIPLevel, projectedVIPLevel } = state;

    const handleProjectionYearChange = (value: string) => {
        dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 15 | 20 });
    };

    const handleOffsetToggle = (checked: boolean) => {
        dispatch({ type: 'SET_USE_POINT_OFFSET', payload: checked });
    };

    const getAveragePointsPerVacation = (ownershipType: 'Deeded Only' | 'Capital Club Member' | 'Club', vipLevel: string) => {
        const basePoints = ownershipType === 'Deeded Only' ? 60000 : 50000;
        const discount = { 'Preferred': 1, 'Silver': 0.95, 'Gold': 0.9, 'Platinum': 0.85 }[vipLevel] || 1;
        return basePoints * discount;
    }

    const avgPointsNow = getAveragePointsPerVacation(ownerProfile.ownershipType, currentVIPLevel);
    const estimatedVacationsNow = (ownerProfile.ownershipType === 'Deeded Only' ? ownerProfile.deedPointValue : ownerProfile.currentPoints) / avgPointsNow;

    const avgPointsNew = getAveragePointsPerVacation('Club', projectedVIPLevel);
    const estimatedVacationsNew = totalPointsAfterUpgrade / avgPointsNew;


    const currentMonthlyPayment = calculateMonthlyPayment(ownerProfile.currentLoanBalance, ownerProfile.currentLoanInterestRate, ownerProfile.currentLoanTerm);
    const currentTotalCost = currentMonthlyPayment * ownerProfile.currentLoanTerm;
    const currentTotalInterest = currentTotalCost - ownerProfile.currentLoanBalance;

    const newMonthlyPayment = calculateMonthlyPayment(upgradeProposal.newLoanAmount, upgradeProposal.newLoanInterestRate, upgradeProposal.newLoanTerm);
    const newTotalCost = newMonthlyPayment * upgradeProposal.newLoanTerm;
    const newTotalInterest = newTotalCost - upgradeProposal.newLoanAmount;

    const calculateCumulativeMf = (initialMf: number, inflationRate: number, years: number) => {
        let total = 0;
        let current = initialMf;
        for (let i = 0; i < years; i++) {
            total += current;
            current *= (1 + inflationRate / 100);
        }
        return total;
    }
    
    const currentMfInflation = ownerProfile.mfInflationRate;

    const currentTotalMf = calculateCumulativeMf(ownerProfile.maintenanceFee, currentMfInflation, projectionYears);
    const newTotalMf = calculateCumulativeMf(upgradeProposal.projectedMF, upgradeProposal.newMfInflationRate, projectionYears);

    const formatCurrency = (value: number) => value > 0 ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0';

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Advantage Controls</CardTitle>
                    <CardDescription>Adjust the projection timeline and strategy to see the full financial picture.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="point-offset" className="text-base">Enable Point Offset Strategy</Label>
                        <Switch id="point-offset" checked={usePointOffset} onCheckedChange={handleOffsetToggle} />
                    </div>
                     <Tabs defaultValue={String(projectionYears)} onValueChange={handleProjectionYearChange} className="w-[270px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="10">10 Years</TabsTrigger>
                            <TabsTrigger value="15">15 Years</T    absTrigger>
                            <TabsTrigger value="20">20 Years</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-3 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">{projectionYears}-Year Ownership Cost Comparison</CardTitle>
                            <CardDescription>
                                Cumulative cost of ownership, including MFs and loan payments. A growing gap means growing savings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ChartContainer config={chartConfig} className="w-full h-full">
                                    <AreaChart data={costProjectionData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorNewAdv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-newCost)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-newCost)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCurrentAdv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-currentCost)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-currentCost)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" unit=" yr" />
                                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
                                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <Legend />
                                        <Area type="monotone" dataKey="currentCost" name="Current Path" strokeWidth={2} stroke="var(--color-currentCost)" fillOpacity={1} fill="url(#colorCurrentAdv)" />
                                        <Area type="monotone" dataKey="newCost" name="Upgrade Path" strokeWidth={2} stroke="var(--color-newCost)" fillOpacity={1} fill="url(#colorNewAdv)" />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Alert variant="destructive">
                            <Flame className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Current path leads to rising fees with no flexible exit strategy.
                            </AlertDescription>
                        </Alert>
                         <Alert className="bg-success/10 border-success/30 text-success-foreground">
                            <Sparkles className="h-4 w-4 text-success" />
                            <AlertTitle className="text-success">Advantage</AlertTitle>
                            <AlertDescription className="text-success/90">
                                Upgrade plan uses your points smarter, reducing long-term costs.
                            </AlertDescription>
                        </Alert>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Vacation Estimator</CardTitle>
                            <CardDescription>Estimated trips per year with your points.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Current Plan</Label>
                                <p className="text-2xl font-bold">Up to {estimatedVacationsNow.toFixed(1)} vacations</p>
                            </div>
                             <div>
                                <Label>Upgrade Plan</Label>
                                <p className="text-2xl font-bold text-success">Up to {estimatedVacationsNew.toFixed(1)} vacations</p>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Loan Cost Analysis</CardTitle>
                        </Header>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Current</TableHead>
                                        <TableHead>Upgrade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow><TableCell>Loan Amount</TableCell><TableCell>{formatCurrency(ownerProfile.currentLoanBalance)}</TableCell><TableCell>{formatCurrency(upgradeProposal.newLoanAmount)}</TableCell></TableRow>
                                    <TableRow><TableCell>Rate</TableCell><TableCell>{ownerProfile.currentLoanInterestRate}%</TableCell><TableCell>{upgradeProposal.newLoanInterestRate}%</TableCell></TableRow>
                                    <TableRow><TableCell>Term</TableCell><TableCell>{ownerProfile.currentLoanTerm} mo</TableCell><TableCell>{upgradeProposal.newLoanTerm} mo</TableCell></TableRow>
                                    <TableRow className="font-bold"><TableCell>Monthly Payment</TableCell><TableCell>{formatCurrency(currentMonthlyPayment)}</TableCell><TableCell>{formatCurrency(newMonthlyPayment)}</TableCell></TableRow>
                                    <TableRow><TableCell>Total Interest</TableCell><TableCell>{formatCurrency(currentTotalInterest)}</TableCell><TableCell>{formatCurrency(newTotalInterest)}</TableCell></TableRow>
                                    <TableRow><TableCell>Total Cost</TableCell><TableCell>{formatCurrency(currentTotalCost)}</TableCell><TableCell>{formatCurrency(newTotalCost)}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                             <CardTitle className="font-headline text-xl">{projectionYears}-Year MF Projection</CardTitle>
                        </Header>
                        <CardContent className="text-center">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Current Path</Label>
                                    <p className="text-3xl font-bold text-destructive">{formatCurrency(currentTotalMf)}</p>
                                    <p className="text-xs text-muted-foreground">Based on {currentMfInflation}% annual inflation</p>
                                </div>
                                 <div>
                                    <Label>Upgrade Path</Label>
                                    <p className="text-3xl font-bold text-success">{formatCurrency(newTotalMf)}</p>
                                     <p className="text-xs text-muted-foreground">Based on {upgradeProposal.newMfInflationRate}% annual inflation</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
};

export default AdvantageCalculator;

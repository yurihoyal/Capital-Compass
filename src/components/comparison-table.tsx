'use client';
import { useAppContext } from '@/contexts/app-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { ComparisonItem } from '@/types';
import { calculateFutureValue } from '@/lib/financial';
import { cn, getTierBadgeClass } from '@/lib/utils';

const DEEDED_INFLATION = 8;
const CLUB_INFLATION = 3;

const ComparisonTable = () => {
    const { state } = useAppContext();
    const { ownerProfile, upgradeProposal, rewardsCalculator, currentVIPLevel, projectedVIPLevel, totalPointsAfterUpgrade } = state;

    const currentMonthlyLoan = Number(ownerProfile.currentMonthlyLoanPayment) || 0;
    const newMonthlyLoan = Number(upgradeProposal.newMonthlyLoanPayment) || 0;

    const currentMonthlyMf = Number(ownerProfile.maintenanceFee) || 0;
    const newMonthlyMf = Number(upgradeProposal.projectedMF) || 0;

    const currentMonthlyTotal = currentMonthlyLoan + currentMonthlyMf;
    const newMonthlyTotal = newMonthlyLoan + newMonthlyMf - (rewardsCalculator.monthlyCredit || 0);

    const mfCost10YearsCurrent = calculateFutureValue(Number(ownerProfile.maintenanceFee || 0) * 12, ownerProfile.ownershipType === 'Deeded Only' ? DEEDED_INFLATION : CLUB_INFLATION, 10) * 10;
    const mfCost10YearsNew = calculateFutureValue(Number(upgradeProposal.projectedMF || 0) * 12, CLUB_INFLATION, 10) * 10;
    
    const getSentiment = (now: number, aNew: number, lowerIsBetter = true) => {
        if(aNew < now) return lowerIsBetter ? 'positive' : 'negative';
        if(aNew > now) return lowerIsBetter ? 'negative' : 'positive';
        return 'neutral';
    }

    const comparisonData: ComparisonItem[] = [
        {
            feature: 'VIP Tier',
            now: <Badge className={cn(getTierBadgeClass(currentVIPLevel))}>{currentVIPLevel || 'N/A'}</Badge>,
            new: <Badge className={cn(getTierBadgeClass(projectedVIPLevel))}>{projectedVIPLevel || 'N/A'}</Badge>,
        },
        {
            feature: 'Points',
            now: ownerProfile.ownershipType === 'Deeded Only' ? (ownerProfile.deedPointValue || 0).toLocaleString() : ownerProfile.currentPoints.toLocaleString(),
            new: (totalPointsAfterUpgrade || 0).toLocaleString(),
            sentiment: getSentiment(Number(ownerProfile.currentPoints), totalPointsAfterUpgrade || 0, false)
        },
        {
            feature: 'Ownership Type',
            now: ownerProfile.ownershipType,
            new: 'Capital Club Member',
            sentiment: ownerProfile.ownershipType === 'Deeded Only' ? 'positive' : 'neutral'
        },
        {
            feature: 'Monthly Cost',
            now: `$${currentMonthlyTotal.toFixed(2)}`,
            new: `$${newMonthlyTotal.toFixed(2)}`,
            sentiment: getSentiment(currentMonthlyTotal, newMonthlyTotal)
        },
        {
            feature: '10-Year MF Cost',
            now: `$${mfCost10YearsCurrent.toLocaleString(undefined, {maximumFractionDigits: 0})}`,
            new: `$${mfCost10YearsNew.toLocaleString(undefined, {maximumFractionDigits: 0})}`,
            sentiment: getSentiment(mfCost10YearsCurrent, mfCost10YearsNew)
        },
        {
            feature: 'Credit Card Offset',
            now: <span className="text-muted-foreground">N/A</span>,
            new: <span className="text-green-600 dark:text-green-400">-${(rewardsCalculator.monthlyCredit || 0).toFixed(2)}/mo</span>,
            sentiment: 'positive'
        }
    ];

    const renderSentimentIcon = (sentiment?: 'positive' | 'negative' | 'neutral') => {
        switch(sentiment) {
            case 'positive': return <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />;
            case 'negative': return <ArrowUp className="h-4 w-4 text-destructive" />;
            default: return <Minus className="h-4 w-4 text-muted-foreground" />;
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px] text-base">Feature</TableHead>
                    <TableHead className="text-base">Now</TableHead>
                    <TableHead className="text-base">New Proposal</TableHead>
                    <TableHead className="text-right text-base">Change</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {comparisonData.map((item) => (
                    <TableRow key={item.feature} className="text-lg">
                        <TableCell className="font-medium">{item.feature}</TableCell>
                        <TableCell>{item.now}</TableCell>
                        <TableCell>{item.new}</TableCell>
                        <TableCell className="text-right flex justify-end items-center gap-2">
                           {renderSentimentIcon(item.sentiment)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ComparisonTable;

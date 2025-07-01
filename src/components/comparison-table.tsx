'use client';
import { useAppContext } from '@/contexts/app-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge';
import { ArrowDown, ArrowUp, CheckCircle, Minus, XCircle } from 'lucide-react';
import { ComparisonItem } from '@/types';
import { calculateMonthlyPayment, calculateFutureValue } from '@/lib/financial';
import { cn } from '@/lib/utils';

const DEEDED_INFLATION = 8;
const CLUB_INFLATION = 3;

const getTierBadgeClass = (tier: string) => {
    switch (tier) {
        case 'Platinum':
            return 'bg-gray-300 text-gray-800 hover:bg-gray-300/80 border-transparent';
        case 'Gold':
            return 'bg-yellow-400 text-black hover:bg-yellow-400/80 border-transparent';
        case 'Silver':
            return 'bg-slate-400 text-black hover:bg-slate-400/80 border-transparent';
        case 'Preferred':
        default:
            return 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent';
    }
};

const ComparisonTable = () => {
    const { state } = useAppContext();
    const { ownerProfile, upgradeProposal, rewardsCalculator, currentVIPLevel, projectedVIPLevel, totalPointsAfterUpgrade } = state;

    const currentMonthlyLoan = calculateMonthlyPayment(ownerProfile.currentLoanBalance, ownerProfile.currentLoanInterestRate, ownerProfile.currentLoanTerm);
    const newMonthlyLoan = calculateMonthlyPayment(upgradeProposal.newLoanAmount, upgradeProposal.newLoanInterestRate, upgradeProposal.newLoanTerm);

    const currentMonthlyMf = ownerProfile.maintenanceFee / 12;
    const newMonthlyMf = upgradeProposal.projectedMF / 12;

    const currentMonthlyTotal = currentMonthlyLoan + currentMonthlyMf;
    const newMonthlyTotal = newMonthlyLoan + newMonthlyMf - (rewardsCalculator.monthlyCredit || 0);

    const mfCost10YearsCurrent = calculateFutureValue(ownerProfile.maintenanceFee, ownerProfile.ownershipType === 'Deeded Only' ? DEEDED_INFLATION : CLUB_INFLATION, 10) * 10;
    const mfCost10YearsNew = calculateFutureValue(upgradeProposal.projectedMF, CLUB_INFLATION, 10) * 10;
    
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
            now: ownerProfile.currentPoints.toLocaleString(),
            new: (totalPointsAfterUpgrade || 0).toLocaleString(),
            sentiment: getSentiment(ownerProfile.currentPoints, totalPointsAfterUpgrade || 0, false)
        },
        {
            feature: 'Booking Window',
            now: `${ownerProfile.ownershipType === 'Deeded Only' ? 'Up to 12' : 'Up to 10'} months`,
            new: 'Up to 12 months',
            sentiment: ownerProfile.ownershipType === 'Deeded Only' ? 'neutral' : 'positive'
        },
        {
            feature: 'Exit Strategy',
            now: ownerProfile.ownershipType === 'Deeded Only' ? <span className="text-destructive flex items-center gap-2"><XCircle size={16}/> In Perpetuity</span> : <span className="text-success flex items-center gap-2"><CheckCircle size={16}/> Flexible</span>,
            new: <span className="text-success flex items-center gap-2"><CheckCircle size={16}/> Flexible</span>,
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

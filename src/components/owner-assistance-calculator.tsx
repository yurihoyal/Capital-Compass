'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Briefcase, Info } from 'lucide-react';
import { cn, getTierBadgeClass } from '@/lib/utils';

const OwnerAssistanceCalculator = () => {
    const { state } = useAppContext();
    const { totalPointsAfterUpgrade, projectedVIPLevel } = state;

    const rateMap: Record<string, number> = {
        Platinum: 0.0045,
        Gold: 0.0042,
        Silver: 0.0039,
        Preferred: 0.0036,
    };
    const defaultRate = 0.0033; // For Deeded or other non-VIP cases

    const eligiblePoints = (totalPointsAfterUpgrade || 0) * 0.5;
    const rate = rateMap[projectedVIPLevel] || defaultRate;
    const netPayout = eligiblePoints * rate;

    // Don't show this calculator if there's no upgrade path or no points
    if (projectedVIPLevel === 'Deeded' || netPayout <= 0) {
        return null;
    }

    const formatCurrency = (value: number) => (value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Owner Assistance Potential
                </CardTitle>
                <CardDescription>
                    Here's the maximum rental income you could qualify for by leveraging unused points.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Potential Annual Payout</p>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(netPayout)}</p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Based on up to 50% of points eligible for the Owner Assistance Program.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                     <div className="flex items-center justify-center gap-2 text-sm">
                        <span>Based on your projected</span>
                        <Badge className={cn(getTierBadgeClass(projectedVIPLevel))}>{projectedVIPLevel}</Badge>
                        <span>tier.</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OwnerAssistanceCalculator;

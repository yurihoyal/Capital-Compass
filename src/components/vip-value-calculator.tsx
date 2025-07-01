'use client';

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Tier = 'Deeded' | 'Preferred' | 'Silver' | 'Gold' | 'Platinum' | string;

interface PerkValues {
    bookingWindow: number;
    unitUpgrades: number;
    goWeeks: number;
    flexAccess: number;
    guestCerts: number;
    aspireBanking: number;
    exclusiveServices: number;
}

// Estimated annual values for each perk by tier
const tierValueMap: Record<Tier, PerkValues> = {
    Deeded:           { bookingWindow: 0,      unitUpgrades: 0,   goWeeks: 0,     flexAccess: 0,    guestCerts: 0,  aspireBanking: 0,   exclusiveServices: 0 },
    Preferred:        { bookingWindow: 150*10, unitUpgrades: 0,   goWeeks: 200,   flexAccess: 50*1, guestCerts: 30, aspireBanking: 0,   exclusiveServices: 0 },
    Silver:           { bookingWindow: 150*11, unitUpgrades: 0,   goWeeks: 400,   flexAccess: 50*2, guestCerts: 60, aspireBanking: 50,  exclusiveServices: 0 },
    Gold:             { bookingWindow: 150*12, unitUpgrades: 375, goWeeks: 600,   flexAccess: 50*4, guestCerts: 90, aspireBanking: 100, exclusiveServices: 400 },
    Platinum:         { bookingWindow: 150*13, unitUpgrades: 500, goWeeks: 1000,  flexAccess: 50*6, guestCerts: 120,aspireBanking: 150, exclusiveServices: 800 },
};


const VipValueCalculator = () => {
    const { state } = useAppContext();
    const { currentVIPLevel, projectedVIPLevel } = state;
    const [mfPerPoint, setMfPerPoint] = useState(0.0070);

    const { annualValueGained, pointEquivalent } = useMemo(() => {
        const currentPerks = tierValueMap[currentVIPLevel] ?? tierValueMap.Deeded;
        const newPerks = tierValueMap[projectedVIPLevel] ?? tierValueMap.Deeded;

        const getCurrentValue = (perks: PerkValues) => Object.values(perks).reduce((sum, val) => sum + val, 0);

        const currentValue = getCurrentValue(currentPerks);
        const newValue = getCurrentValue(newPerks);
        
        const annualValueGained = Math.max(0, newValue - currentValue);
        const pointEquivalent = mfPerPoint > 0 ? annualValueGained / mfPerPoint : 0;
        
        return { annualValueGained, pointEquivalent };
    }, [currentVIPLevel, projectedVIPLevel, mfPerPoint]);
    
    if (annualValueGained <= 0 || currentVIPLevel === projectedVIPLevel) {
        return null;
    }

    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const formatNumber = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 0 });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Your VIP Value Calculator</CardTitle>
                <CardDescription>Quantifying the added value of your loyalty tier upgrade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <Label>Current Tier</Label>
                        <p className="text-xl font-bold">{currentVIPLevel}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <Label>New Tier</Label>
                        <p className="text-xl font-bold">{projectedVIPLevel}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <Label>Annual Value Gained</Label>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(annualValueGained)}</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <Label>Bonus Point Equivalent</Label>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatNumber(pointEquivalent)} pts</p>
                    </div>
                </div>

                <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <p className="text-lg text-green-800 dark:text-green-200">
                        Your new VIP level delivers an estimated <strong className="font-bold">{formatCurrency(annualValueGained)}</strong> in added value every year.
                    </p>
                </div>
                
                 <div className="grid md:grid-cols-3 gap-4 text-center">
                     <div className="p-4 border rounded-lg">
                        <Label>10-Year Total Value</Label>
                        <p className="text-2xl font-bold">{formatCurrency(annualValueGained * 10)}</p>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <Label>15-Year Total Value</Label>
                        <p className="text-2xl font-bold">{formatCurrency(annualValueGained * 15)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <Label>20-Year Total Value</Label>
                        <p className="text-2xl font-bold">{formatCurrency(annualValueGained * 20)}</p>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-4 pt-4">
                     <Label htmlFor="mf-per-point">Point Value ($)</Label>
                     <Input
                        id="mf-per-point"
                        type="number"
                        step="0.0001"
                        value={mfPerPoint}
                        onChange={(e) => setMfPerPoint(parseFloat(e.target.value) || 0)}
                        className="w-32 text-center"
                     />
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground text-center w-full">
                    *Value estimations are based on average usage and market rates for similar travel and booking services. Point value is adjustable.
                 </p>
            </CardFooter>
        </Card>
    );
};

export default VipValueCalculator;

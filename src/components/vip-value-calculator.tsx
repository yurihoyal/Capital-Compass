'use client';

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const VipValueCalculator = () => {
    const { state } = useAppContext();
    const { currentVIPLevel, projectedVIPLevel, annualVipValueGained: annualValueGained } = state;
    const [mfPerPoint, setMfPerPoint] = useState(0.0070);

    const { pointEquivalent } = useMemo(() => {
        const pointEquivalent = mfPerPoint > 0 ? annualValueGained / mfPerPoint : 0;
        return { pointEquivalent };
    }, [annualValueGained, mfPerPoint]);
    
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
                        <p className="text-xl font-bold text-success">{formatCurrency(annualValueGained)}</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <Label>Bonus Point Equivalent</Label>
                        <p className="text-xl font-bold text-success">{formatNumber(pointEquivalent)} pts</p>
                    </div>
                </div>

                <div className="text-center p-4 border rounded-lg bg-success/10 border-success/20">
                    <p className="text-lg text-foreground">
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

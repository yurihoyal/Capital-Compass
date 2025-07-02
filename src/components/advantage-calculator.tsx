'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import CurrentOwnershipProjection from './current-ownership-projection';
import NewOwnershipProjection from './new-ownership-projection';

const AdvantageCalculator = () => {
    const { state, dispatch } = useAppContext();
    const { projectionYears, usePointOffset } = state;

    const handleProjectionYearChange = (value: string) => {
        dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 15 | 20 });
    };

    const handleOffsetToggle = (checked: boolean) => {
        dispatch({ type: 'SET_USE_POINT_OFFSET', payload: checked });
    };

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Advantage Controls</CardTitle>
                    <CardDescription>Adjust the projection timeline and strategy to see the full financial picture.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="point-offset" className="text-base">Enable Point Offset Strategy</Label>
                        <Switch id="point-offset" checked={usePointOffset} onCheckedChange={handleOffsetToggle} />
                    </div>
                     <Tabs defaultValue={String(projectionYears)} onValueChange={handleProjectionYearChange} className="w-[270px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="10">10 Years</TabsTrigger>
                            <TabsTrigger value="15">15 Years</TabsTrigger>
                            <TabsTrigger value="20">20 Years</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
                <CurrentOwnershipProjection />
                <NewOwnershipProjection />
            </div>
        </div>
    );
};

export default AdvantageCalculator;

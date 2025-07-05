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
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <CurrentOwnershipProjection />

            <Card className="h-full flex flex-col justify-center">
                <CardHeader className="items-center text-center">
                    <CardTitle className="font-headline text-2xl">Advantage Controls</CardTitle>
                    <CardDescription>Adjust projection timeline and strategy.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Label htmlFor="point-offset" className="text-base">Enable points savings program</Label>
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

            <NewOwnershipProjection />
        </div>
    );
};

export default AdvantageCalculator;

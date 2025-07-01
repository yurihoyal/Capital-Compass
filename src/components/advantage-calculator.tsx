// @ts-nocheck
'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from './ui/chart';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    const { costProjectionData, projectionYears, usePointOffset } = state;

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
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="point-offset" className="text-base">Enable Point Offset Strategy</Label>
                            <Switch id="point-offset" checked={usePointOffset} onCheckedChange={handleOffsetToggle} />
                        </div>
                        <p className="text-xs text-muted-foreground">Offsets are generated from unused points rental (50% max) and credit card rewards.</p>
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

            <div className="grid lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-5 space-y-8">
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
                                        <Tooltip />
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
                         <Alert className="border-green-600/30 bg-green-600/10 text-green-900 dark:text-green-200">
                            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">Advantage</AlertTitle>
                            <AlertDescription>
                                Upgrade plan uses your points smarter, reducing long-term costs.
                            </AlertDescription>
                        </Alert>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default AdvantageCalculator;

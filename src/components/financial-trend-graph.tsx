'use client';
import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { useAppContext } from '@/contexts/app-context';
import { ChartTooltipContent } from './ui/chart';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const FinancialTrendGraph = () => {
    const { state, dispatch } = useAppContext();
    const { costProjectionData, projectionYears } = state;

    const handleTabChange = (value: string) => {
        dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 20 });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-xl">Projected Cost Over Time</CardTitle>
                        <CardDescription>
                            This graph shows the total cumulative cost of ownership, including MFs and loan payments.
                            The "What If I Do Nothing?" line represents the regret curve.
                        </CardDescription>
                    </div>
                     <Tabs defaultValue={String(projectionYears)} onValueChange={handleTabChange} className="w-[180px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="10">10 Years</TabsTrigger>
                            <TabsTrigger value="20">20 Years</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={costProjectionData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" unit=" yr" />
                            <YAxis
                                tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                                width={80}
                            />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Area type="monotone" dataKey="currentCost" name="What If I Do Nothing?" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorCurrent)" />
                            <Area type="monotone" dataKey="newCost" name="Upgrade Proposal" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorNew)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
             <CardFooter className="text-center justify-center">
                <p className="text-muted-foreground text-sm">Lower is better. The upgrade shows significant long-term savings.</p>
            </CardFooter>
        </Card>
    );
};

export default FinancialTrendGraph;

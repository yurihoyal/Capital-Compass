'use client';
import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { useAppContext } from '@/contexts/app-context';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from './ui/chart';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const chartConfig = {
  currentCost: {
    label: "What If I Do Nothing?",
    color: "hsl(var(--destructive))",
  },
  newCost: {
    label: "Upgrade Proposal",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const FinancialTrendGraph = () => {
    const { state, dispatch } = useAppContext();
    const { costProjectionData, projectionYears } = state;

    const handleTabChange = (value: string) => {
        dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 15 | 20 });
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
                     <Tabs defaultValue={String(projectionYears)} onValueChange={handleTabChange} className="w-[270px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="10">10 Years</TabsTrigger>
                            <TabsTrigger value="15">15 Years</TabsTrigger>
                            <TabsTrigger value="20">20 Years</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <AreaChart
                            data={costProjectionData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-newCost)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-newCost)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-currentCost)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-currentCost)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" unit=" yr" interval={0} />
                            <YAxis
                                tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                                width={80}
                            />
                            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Legend />
                            <Area type="monotone" dataKey="currentCost" name="What If I Do Nothing?" strokeWidth={2} stroke="var(--color-currentCost)" fillOpacity={1} fill="url(#colorCurrent)" />
                            <Area type="monotone" dataKey="newCost" name="Upgrade Proposal" strokeWidth={2} stroke="var(--color-newCost)" fillOpacity={1} fill="url(#colorNew)" />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
             <CardFooter className="text-center justify-center">
                <p className="text-muted-foreground text-sm">Lower is better. The upgrade shows significant long-term savings.</p>
            </CardFooter>
        </Card>
    );
};

export default FinancialTrendGraph;

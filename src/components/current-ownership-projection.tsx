// @ts-nocheck
'use client';
import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from './ui/chart';

const chartConfig = {
  cumulativeCost: {
    label: "Total Cost",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const CurrentOwnershipProjection = () => {
  const { state, dispatch } = useAppContext();
  const { currentPathProjection, currentPathSummary, projectionYears } = state;

  const handleProjectionYearChange = (value: string) => {
    dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 15 | 20 });
  };
  
  const formatCurrency = (value) => value > 0 ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0';

  return (
    <Card className="h-full flex flex-col bg-muted/30">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Your Ownership Path if You Change Nothing</CardTitle>
        <CardDescription>Projected total ownership cost over time, including loan payments and inflating maintenance fees.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <Tabs defaultValue={String(projectionYears)} onValueChange={handleProjectionYearChange} className="w-[270px] self-center">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="10">10 Years</TabsTrigger>
                <TabsTrigger value="15">15 Years</TabsTrigger>
                <TabsTrigger value="20">20 Years</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <AreaChart data={currentPathProjection} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-cumulativeCost)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-cumulativeCost)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit=" yr" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    <Area type="monotone" dataKey="cumulativeCost" name="Total Ownership Cost" strokeWidth={2} stroke="var(--color-cumulativeCost)" fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
            </ChartContainer>
        </div>
        <div>
            <h4 className="font-semibold text-center mb-2">Total Ownership Cost Over {projectionYears} Years</h4>
            <p className="text-4xl font-bold text-destructive text-center mb-2">{formatCurrency(currentPathSummary.totalCost)}</p>
            <div className="text-sm text-muted-foreground text-center grid grid-cols-2 gap-2">
                <span>Total Interest: <span className="font-medium text-foreground">{formatCurrency(currentPathSummary.totalInterest)}</span></span>
                <span>Total MFs: <span className="font-medium text-foreground">{formatCurrency(currentPathSummary.totalMf)}</span></span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CurrentOwnershipProjection;

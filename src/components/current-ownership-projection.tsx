// @ts-nocheck
'use client';
import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from './ui/chart';

const chartConfig = {
  "Maintenance Fees": {
    label: "Maintenance Fees",
    color: "hsl(var(--chart-2))",
  },
  "Loan Payments": {
    label: "Loan Payments",
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
        <CardTitle className="font-headline text-xl">Annual Ownership Cost (Current Path)</CardTitle>
        <CardDescription>This chart shows the projected annual costs. Loan payments will stop, but maintenance fees continue to inflate.</CardDescription>
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
                        <linearGradient id="colorMf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-Maintenance Fees)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-Maintenance Fees)" stopOpacity={0} />
                        </linearGradient>
                         <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-Loan Payments)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-Loan Payments)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit=" yr" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    <Area type="monotone" dataKey="Maintenance Fees" stackId="1" name="Maintenance Fees" strokeWidth={2} stroke="var(--color-Maintenance Fees)" fillOpacity={1} fill="url(#colorMf)" />
                    <Area type="monotone" dataKey="Loan Payments" stackId="1" name="Loan Payments" strokeWidth={2} stroke="var(--color-Loan Payments)" fillOpacity={1} fill="url(#colorLoan)" />
                </AreaChart>
            </ChartContainer>
        </div>
        <div>
            <h4 className="font-semibold text-center mb-2">Total Ownership Cost Over {projectionYears} Years</h4>
            <p className="text-4xl font-bold text-destructive text-center mb-2">{formatCurrency(currentPathSummary.totalCost)}</p>
            <div className="text-sm text-muted-foreground text-center grid grid-cols-2 gap-2">
                <span>Total MFs: <span className="font-medium text-foreground">{formatCurrency(currentPathSummary.totalMf)}</span></span>
                <span>Total Loan: <span className="font-medium text-foreground">{formatCurrency(currentPathSummary.totalLoanPaid)}</span></span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CurrentOwnershipProjection;

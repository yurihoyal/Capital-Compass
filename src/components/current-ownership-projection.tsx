// @ts-nocheck
'use client';
import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from './ui/chart';

const chartConfig = {
  maintenanceFees: {
    label: "Maintenance Fees",
    color: "hsl(var(--destructive))",
  },
  loanPayments: {
    label: "Loan Payments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// Custom tooltip component to show monthly breakdown
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const monthlyMf = Number(data.monthlyMf || 0);
    const monthlyLoan = Number(data.monthlyLoan || 0);
    const totalMonthly = monthlyMf + monthlyLoan;

    return (
      <div className="p-3 bg-background/90 border rounded-lg shadow-lg text-sm backdrop-blur-sm">
        <p className="label font-bold mb-2">{`Year ${label}`}</p>
        <div className="space-y-1">
            <p className="text-destructive flex justify-between items-center">
                <span>Monthly MF:</span>
                <span className="font-semibold ml-2">${monthlyMf.toFixed(2)}</span>
            </p>
            {monthlyLoan > 0 && (
                <p style={{ color: 'hsl(var(--chart-1))' }} className="flex justify-between items-center">
                    <span>Monthly Loan:</span>
                    <span className="font-semibold ml-2">${monthlyLoan.toFixed(2)}</span>
                </p>
            )}
        </div>
        <p className="intro font-bold mt-2 border-t pt-2 flex justify-between items-center">
            <span>Total Monthly Cost:</span>
            <span className="font-semibold ml-2">${totalMonthly.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CurrentOwnershipProjection = () => {
  const { state } = useAppContext();
  const { currentPathProjection, currentPathSummary, projectionYears } = state;

  const formatCurrency = (value: number) => value > 0 ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0';

  return (
    <Card className="h-full flex flex-col bg-muted/30">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Annual Ownership Cost (Current Path)</CardTitle>
        <CardDescription>This chart shows the projected annual costs. Loan payments will stop, but maintenance fees continue to inflate.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <AreaChart data={currentPathProjection} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-maintenanceFees)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-maintenanceFees)" stopOpacity={0} />
                        </linearGradient>
                         <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-loanPayments)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-loanPayments)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit=" yr" type="number" domain={['dataMin', 'dataMax']} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="maintenanceFees" stackId="1" name="Maintenance Fees" strokeWidth={2} stroke="var(--color-maintenanceFees)" fillOpacity={1} fill="url(#colorMf)" />
                    <Area type="monotone" dataKey="loanPayments" stackId="1" name="Loan Payments" strokeWidth={2} stroke="var(--color-loanPayments)" fillOpacity={1} fill="url(#colorLoan)" />
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

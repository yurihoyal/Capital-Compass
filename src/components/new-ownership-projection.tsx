// @ts-nocheck
'use client';
import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from './ui/chart';

const chartConfig = {
  maintenanceFees: {
    label: "Maintenance Fees",
    color: "hsl(var(--chart-2))", // Use green for new path
  },
  loanPayments: {
    label: "Loan Payments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// Custom tooltip component to show monthly breakdown
const CustomTooltip = ({ active, payload, label }: any) => {
  const { state } = useAppContext();
  const manualMonthlyLoan = state.upgradeProposal.newMonthlyLoanPayment || 0;
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const monthlyMf = Number(data.monthlyMf || 0);
    const isLoanActive = data.loanPayments > 0;
    const monthlyLoanToDisplay = isLoanActive ? manualMonthlyLoan : 0;
    const totalMonthly = monthlyMf + monthlyLoanToDisplay;

    return (
      <div className="p-3 bg-background/90 border rounded-lg shadow-lg text-sm backdrop-blur-sm">
        <p className="label font-bold mb-2">{`Year ${label}`}</p>
        <div className="space-y-1">
            <p style={{ color: 'hsl(var(--chart-2))' }} className="flex justify-between items-center">
                <span>Monthly MF:</span>
                <span className="font-semibold ml-2">${monthlyMf.toFixed(2)}</span>
            </p>
            {monthlyLoanToDisplay > 0 && (
                <p style={{ color: 'hsl(var(--chart-1))' }} className="flex justify-between items-center">
                    <span>Monthly Loan:</span>
                    <span className="font-semibold ml-2">${monthlyLoanToDisplay.toFixed(2)}</span>
                </p>
            )}
        </div>
        <p className="intro font-bold mt-2 border-t pt-2 flex justify-between items-center">
            <span>Total Monthly Cost: </span>
            <span className="font-semibold ml-2">${totalMonthly.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const NewOwnershipProjection = () => {
  const { state } = useAppContext();
  const { newPathProjection, newPathSummary, projectionYears, usePointOffset, totalAnnualPotential } = state;
  const yearTicks = Array.from({ length: projectionYears }, (_, i) => i + 1);

  const formatCurrency = (value: number) => value >= 0 ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `-$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatTotalPotential = (value: number) => (value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });


  return (
    <Card className="h-full flex flex-col bg-success/10">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Annual Ownership Cost (Upgrade Path)</CardTitle>
        <CardDescription>
            {usePointOffset 
             ? "Projected annual costs with the Point Offset Strategy applied." 
             : "This chart shows projected annual costs for the new upgrade."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <AreaChart data={newPathProjection} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorNewMf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-maintenanceFees)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-maintenanceFees)" stopOpacity={0} />
                        </linearGradient>
                         <linearGradient id="colorNewLoan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-loanPayments)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-loanPayments)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit=" yr" type="number" domain={['dataMin', 'dataMax']} interval={0} ticks={yearTicks} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="maintenanceFees" stackId="1" name="Maintenance Fees" strokeWidth={2} stroke="var(--color-maintenanceFees)" fillOpacity={1} fill="url(#colorNewMf)" />
                    <Area type="monotone" dataKey="loanPayments" stackId="1" name="Loan Payments" strokeWidth={2} stroke="var(--color-loanPayments)" fillOpacity={1} fill="url(#colorNewLoan)" />
                </AreaChart>
            </ChartContainer>
        </div>
        <div>
            <h4 className="font-semibold text-center mb-2">Total Ownership Cost Over {projectionYears} Years</h4>
            <p className="text-4xl font-bold text-success text-center mb-2">{formatCurrency(newPathSummary.totalCost)}</p>
            <div className="text-sm text-muted-foreground text-center grid grid-cols-2 gap-2">
                <span>Total MFs: <span className="font-medium text-foreground">{formatCurrency(newPathSummary.totalMf)}</span></span>
                <span>Total Loan: <span className="font-medium text-foreground">{formatCurrency(newPathSummary.totalLoanPaid)}</span></span>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-center mb-2">Total Annual Potential Value</h4>
            <p className="text-3xl font-bold text-success text-center">{formatTotalPotential(totalAnnualPotential)}</p>
            <p className="text-xs text-muted-foreground text-center mt-1 px-4">Includes VIP booking discounts, 5X travel rewards, and Owner Assistance payouts — converting unused points into real value to reduce your annual ownership cost.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewOwnershipProjection;

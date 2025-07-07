'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RewardsCalculatorData, RewardsCalculatorSchema } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

const RewardsSavingsCalculator = () => {
    const { state, dispatch } = useAppContext();
    const { rewardsCalculator, ownerProfile } = state;

    const form = useForm<RewardsCalculatorData>({
        resolver: zodResolver(RewardsCalculatorSchema),
        defaultValues: rewardsCalculator,
    });
    
    const { reset, getValues } = form;

    useEffect(() => {
        const rewardsCalculatorString = JSON.stringify(rewardsCalculator);
        if (rewardsCalculatorString !== JSON.stringify(getValues())) {
            reset(rewardsCalculator);
        }
    }, [rewardsCalculator, reset, getValues]);


    const handleFormChange = () => {
        dispatch({ type: 'UPDATE_REWARDS_CALCULATOR', payload: getValues() });
        dispatch({ type: 'SET_REWARDS_SPEND_MANUALLY_SET', payload: true });
    };

    const annualMaintenanceFee = (ownerProfile.maintenanceFee || 0) * 12;
    const mfChartData = [
        { 
            name: 'Maintenance Fee', 
            'Out-of-Pocket': annualMaintenanceFee, 
            'After Rewards': Math.max(0, annualMaintenanceFee - (rewardsCalculator.annualCredit || 0)) 
        }
    ];

    const formatNumber = (value: number) => (value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center justify-between">
                    Rewards Savings Calculator
                    <TooltipProvider>
                        <UiTooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This projection shows how using the Capital Mastercard® for everyday spend can<br/>reduce real ownership costs — without using any vacation points.</p>
                            </TooltipContent>
                        </UiTooltip>
                    </TooltipProvider>
                </CardTitle>
                <CardDescription>Project how Capital Mastercard® savings can reduce maintenance fees.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                    <Form {...form}>
                        <form className="space-y-4" onBlur={handleFormChange}>
                            <FormField
                                control={form.control}
                                name="monthlySpend"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Monthly Spend ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="2000" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    
                    <div className="grid grid-cols-1 gap-4 text-center mt-6">
                        <Card className="bg-muted/50 p-3">
                            <p className="text-sm font-medium text-muted-foreground">Total Redeemable Points</p>
                            <p className="text-2xl font-bold">{formatNumber(rewardsCalculator.totalRewards || 0)} pts</p>
                            <p className="text-xs text-muted-foreground">Includes 6 pts/$ avg. & 5% redemption bonus</p>
                        </Card>
                    </div>

                    <div className="mt-4 text-center p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Monthly Maintenance Fee Offset</p>
                        <p className="text-3xl font-bold text-success">
                            ${(rewardsCalculator.monthlyCredit || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">(Annual Credit: ${(rewardsCalculator.annualCredit || 0).toFixed(2)})</p>
                    </div>
                </div>
                
                <div className="h-[150px] w-full mt-4">
                     <p className="text-sm font-medium text-center mb-2">Annual MF Cost Reduction</p>
                     <ChartContainer config={{}} className="w-full h-full">
                        <BarChart data={mfChartData} layout="vertical" margin={{ left: 30, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip cursor={{fill: 'transparent'}} content={<ChartTooltipContent indicator="dot" />} />
                            <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
                            <Bar dataKey="Out-of-Pocket" fill="hsl(var(--destructive))" radius={[4, 4, 4, 4]} />
                            <Bar dataKey="After Rewards" fill="hsl(var(--success))" radius={[4, 4, 4, 4]} />
                        </BarChart>
                    </ChartContainer>
                </div>

            </CardContent>
        </Card>
    );
};

export default RewardsSavingsCalculator;
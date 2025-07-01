'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RewardsCalculatorData, RewardsCalculatorSchema } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const RewardsSavingsCalculator = () => {
    const { state, dispatch } = useAppContext();
    const { rewardsCalculator, ownerProfile } = state;

    const form = useForm<RewardsCalculatorData>({
        resolver: zodResolver(RewardsCalculatorSchema),
        defaultValues: rewardsCalculator,
    });
    
    const { watch, reset, setValue, getValues } = form;

    useEffect(() => {
        reset(rewardsCalculator);
    }, [rewardsCalculator, reset]);

    const handleFormChange = () => {
        dispatch({ type: 'UPDATE_REWARDS_CALCULATOR', payload: getValues() });
    };

    const handleSliderChange = (value: number[], field: 'percentAt5x' | 'percentAt2x') => {
        const otherField = field === 'percentAt5x' ? 'percentAt2x' : 'percentAt5x';
        const newValue = value[0];
        const otherValue = getValues(otherField);

        if (newValue + otherValue > 100) {
            setValue(otherField, 100 - newValue);
        }
        setValue(field, newValue);
        handleFormChange();
    };

    const mfChartData = [
        { 
            name: 'Maintenance Fee', 
            'Out-of-Pocket': ownerProfile.maintenanceFee, 
            'After Rewards': Math.max(0, ownerProfile.maintenanceFee - rewardsCalculator.annualCredit) 
        }
    ];

    const formatNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 });

    return (
        <Card className="h-full flex flex-col">
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
                <Form {...form}>
                    <form className="space-y-4" onChange={handleFormChange}>
                         <FormField
                            control={form.control}
                            name="totalAnnualSpend"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Estimated Annual Spend ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="20000" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="percentAt5x"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Spend on Capital Vacations ({field.value}%) - 5X Rewards</FormLabel>
                                    <FormControl>
                                        <Slider
                                            value={[field.value]}
                                            onValueChange={(value) => handleSliderChange(value, 'percentAt5x')}
                                            max={100}
                                            step={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="percentAt2x"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Spend on Travel, Gas, EV ({field.value}%) - 2X Rewards</FormLabel>
                                    <FormControl>
                                        <Slider
                                            value={[field.value]}
                                            onValueChange={(value) => handleSliderChange(value, 'percentAt2x')}
                                            max={100}
                                            step={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="text-sm text-muted-foreground">
                            <p>% on Other Purchases (1X Rewards): {rewardsCalculator.percentAt1x}%</p>
                        </div>
                        <FormField
                            control={form.control}
                            name="overrideRewardsPoints"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Override Reward Points (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter total points to override calculation" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                
                <div className="grid grid-cols-3 gap-2 text-center mt-4">
                    <Card className="bg-muted/50 p-2">
                        <p className="text-xs font-medium text-muted-foreground">Base Rewards</p>
                        <p className="text-lg font-bold">{formatNumber(rewardsCalculator.baseRewards)}</p>
                    </Card>
                    <Card className="bg-muted/50 p-2">
                        <p className="text-xs font-medium text-muted-foreground">5% Bonus</p>
                        <p className="text-lg font-bold">{formatNumber(rewardsCalculator.bonusRewards)}</p>
                    </Card>
                     <Card className="bg-muted/50 p-2">
                        <p className="text-xs font-medium text-muted-foreground">Total Rewards</p>
                        <p className="text-lg font-bold">{formatNumber(rewardsCalculator.totalRewards)}</p>
                    </Card>
                </div>

                 <div className="mt-4 text-center p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Monthly Maintenance Fee Offset</p>
                    <p className="text-3xl font-bold text-success">
                        ${rewardsCalculator.monthlyCredit.toFixed(2)}
                    </p>
                     <p className="text-sm text-muted-foreground">(Annual Credit: ${rewardsCalculator.annualCredit.toFixed(2)})</p>
                </div>
                
                <div className="h-[150px] w-full mt-4">
                     <p className="text-sm font-medium text-center mb-2">MF Cost Reduction</p>
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

    
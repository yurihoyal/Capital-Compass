'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TravelServicesCalculatorData, TravelServicesCalculatorSchema } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from './ui/separator';

const TravelServicesValueCalculator = () => {
    const { state, dispatch } = useAppContext();
    const { travelServicesCalculator } = state;

    const form = useForm<TravelServicesCalculatorData>({
        resolver: zodResolver(TravelServicesCalculatorSchema),
        defaultValues: travelServicesCalculator,
    });
    
    const { control, reset, getValues, setValue } = form;

    const travelServicesCalculatorString = JSON.stringify(travelServicesCalculator);
    useEffect(() => {
        reset(travelServicesCalculator);
    }, [travelServicesCalculatorString, reset]);

    const handleFormChange = () => {
        dispatch({ type: 'UPDATE_TRAVEL_SERVICES_CALCULATOR', payload: getValues() });
    };
    
    const handleCheckboxChange = (checked: boolean) => {
        setValue('applyToProjection', checked);
        handleFormChange();
    };

    const formatCurrency = (value: number) => (value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const savings10 = (travelServicesCalculator.estimatedSavings || 0) * 10;
    const savings15 = (travelServicesCalculator.estimatedSavings || 0) * 15;
    const savings20 = (travelServicesCalculator.estimatedSavings || 0) * 20;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Travel Services Value Calculator</CardTitle>
                <CardDescription>Redirect your travel spend to unlock more value from your ownership.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-6" onChange={handleFormChange}>
                        <FormField
                            control={control}
                            name="pointsForTravel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Points for Travel Services Annually</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 50000" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name="outOfPocketSpend"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Typical Annual Out-of-Pocket Travel Spend</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 2500" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="applyToProjection"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0 rounded-md border p-4 mt-4">
                                <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Apply this redirection toward upgrade cost projection
                                </FormLabel>
                                </div>
                            </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                            <FormLabel>Cash Value of Points</FormLabel>
                            <p className="text-2xl font-bold">{formatCurrency(travelServicesCalculator.cashValueOfPoints || 0)}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <FormLabel>Estimated Annual Savings</FormLabel>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(travelServicesCalculator.estimatedSavings || 0)}</p>
                        </div>
                    </div>
                    
                    {(travelServicesCalculator.estimatedSavings || 0) > 0 &&
                        <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <p className="text-green-800 dark:text-green-200">
                                You’re keeping <strong className="font-bold">{formatCurrency(travelServicesCalculator.estimatedSavings || 0)}</strong> in your pocket by using your points for travel instead of cash.
                            </p>
                        </div>
                    }

                    {(travelServicesCalculator.estimatedSavings || 0) > 0 &&
                    <>
                        <Separator />
                        <p className="text-sm font-semibold text-center">Cumulative Savings Over Time</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 border rounded-lg">
                                <FormLabel>10 Years</FormLabel>
                                <p className="text-lg font-bold">{formatCurrency(savings10)}</p>
                            </div>
                            <div className="p-2 border rounded-lg">
                                <FormLabel>15 Years</FormLabel>
                                <p className="text-lg font-bold">{formatCurrency(savings15)}</p>
                            </div>
                            <div className="p-2 border rounded-lg">
                                <FormLabel>20 Years</FormLabel>
                                <p className="text-lg font-bold">{formatCurrency(savings20)}</p>
                            </div>
                        </div>
                    </>
                    }
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground text-center w-full italic">
                    Redirecting your normal travel spend inside Capital means this upgrade could actually cost you less than doing nothing.
                 </p>
            </CardFooter>
        </Card>
    );
};

export default TravelServicesValueCalculator;

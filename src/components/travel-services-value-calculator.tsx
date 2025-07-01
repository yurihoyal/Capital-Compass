'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TravelServicesCalculatorData, TravelServicesCalculatorSchema } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TravelServicesValueCalculator = () => {
    const { state, dispatch } = useAppContext();
    const { travelServicesCalculator } = state;

    const form = useForm<TravelServicesCalculatorData>({
        resolver: zodResolver(TravelServicesCalculatorSchema),
        defaultValues: travelServicesCalculator,
    });
    
    const { control, reset, getValues } = form;

    useEffect(() => {
        if (JSON.stringify(travelServicesCalculator) !== JSON.stringify(getValues())) {
            reset(travelServicesCalculator);
        }
    }, [travelServicesCalculator, reset, getValues]);


    const handleFormChange = () => {
        dispatch({ type: 'UPDATE_TRAVEL_SERVICES_CALCULATOR', payload: getValues() });
    };
    
    const formatCurrency = (value: number) => (value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Travel Services Value Calculator</CardTitle>
                <CardDescription>
                    Turn your unused Club Points into real travel — including hotels, resorts, cruises, and rental cars — through Capital’s Travel Services. It’s a flexible way to maximize your ownership and save cash on trips you’re already planning.
                </CardDescription>
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
                    </form>
                </Form>

                <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                            <Label>Cash Value of Points</Label>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(travelServicesCalculator.cashValueOfPoints || 0)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TravelServicesValueCalculator;

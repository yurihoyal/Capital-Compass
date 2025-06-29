'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCardRewards, CreditCardRewardsSchema, redemptionTypes } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

const CreditCardModule = () => {
  const { state, dispatch } = useAppContext();

  const form = useForm<CreditCardRewards>({
    resolver: zodResolver(CreditCardRewardsSchema),
    defaultValues: state.creditCardRewards,
  });

  const { watch, reset } = form;

  useEffect(() => {
    reset(state.creditCardRewards);
  }, [state.creditCardRewards, reset]);

  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type) { // Only dispatch on user input, not programmatic changes like `reset`
        dispatch({ type: 'UPDATE_CREDIT_CARD_REWARDS', payload: value as CreditCardRewards });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Rewards Credit Card</CardTitle>
        <CardDescription>Estimate savings from card usage.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="estimatedAnnualSpend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Annual Spend ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="redemptionType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Redemption Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a redemption type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {redemptionTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="rewardRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="1.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Calculated Annual Savings</p>
                <p className="text-3xl font-bold text-success">
                    ${(state.creditCardRewards.calculatedSavings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreditCardModule;

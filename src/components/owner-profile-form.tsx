'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OwnerProfile, OwnerProfileSchema, ownershipTypes, painPoints } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from './ui/checkbox';

const OwnerProfileForm = () => {
  const { state, dispatch } = useAppContext();

  const form = useForm<OwnerProfile>({
    resolver: zodResolver(OwnerProfileSchema),
    defaultValues: state.ownerProfile,
  });

  const { watch, reset, formState: { isDirty } } = form;

  useEffect(() => {
    reset(state.ownerProfile);
  }, [state.ownerProfile, reset]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && isDirty) {
        dispatch({ type: 'UPDATE_OWNER_PROFILE', payload: value as OwnerProfile });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch, isDirty]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Current Ownership Details</CardTitle>
        <CardDescription>Enter the client's current ownership information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="(555) 555-5555" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="ownershipType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Ownership Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center space-x-4"
                                >
                                {ownershipTypes.map((type) => (
                                    <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={type} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{type}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currentPoints"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Current Points</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="150000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maintenanceFee"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Annual Maintenance Fee ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="2000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="currentLoanBalance"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Current Loan Balance ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="10000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="currentLoanInterestRate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Current Loan Interest Rate (%)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" placeholder="8.5" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currentLoanTerm"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Remaining Loan Term (Months)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="60" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                    control={form.control}
                    name="painPoints"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Pain Points</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        {painPoints.map((item) => (
                            <FormField
                            key={item}
                            control={form.control}
                            name="painPoints"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {item}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OwnerProfileForm;

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpgradeProposal, UpgradeProposalSchema, loanTerms } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';

const UpgradeProposalForm = () => {
  const { state, dispatch } = useAppContext();
  const isClubMember = state.ownerProfile.ownershipType === 'Capital Club Member';

  const form = useForm<UpgradeProposal>({
    resolver: zodResolver(UpgradeProposalSchema),
    defaultValues: state.upgradeProposal,
  });

  const { reset, getValues, control } = form;

  const upgradeProposalString = JSON.stringify(state.upgradeProposal);
  useEffect(() => {
    reset(state.upgradeProposal);
  }, [upgradeProposalString, reset]);

  const handleFormChange = () => {
    dispatch({ type: 'UPDATE_UPGRADE_PROPOSAL', payload: getValues() });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upgrade Proposal</CardTitle>
        <CardDescription>Enter the details for the proposed ownership upgrade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8" onChange={handleFormChange}>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="newPointsAdded"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New Points Added</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="150000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {isClubMember && (
                      <FormField
                          control={form.control}
                          name="convertedDeedsToPoints"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Points from Converted Deeds</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                    )}
                    <FormField
                        control={form.control}
                        name="projectedMF"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Projected Annual Maintenance Fee ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="2500" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="newMfInflationRate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New MF Inflation Rate ({field.value}%)</FormLabel>
                            <FormControl>
                                <Slider
                                    min={1}
                                    max={30}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="newLoanAmount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New Loan Amount ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="25000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newLoanTerm"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New Loan Term</FormLabel>
                             <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a loan term" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {loanTerms.map(term => (
                                    <SelectItem key={term} value={String(term)}>{term / 12} years</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newLoanInterestRate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New Loan Interest Rate (%)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" placeholder="7.5" {...field} />
                            </FormControl>
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

export default UpgradeProposalForm;

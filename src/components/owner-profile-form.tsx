'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OwnerProfile, OwnerProfileSchema, ownershipTypes } from '@/types';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Info, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import CurrentOwnershipProjection from './current-ownership-projection';
import { cn, getTierBadgeClass } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';


const DeededOwnerWarning = () => (
  <Alert variant="destructive" className="border-destructive/50 text-destructive [&>svg]:text-destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle className="font-bold flex items-center justify-between">
      Deeded Owner Alert
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Club upgrades provide booking power, exit pathways, <br/> cost protection, and VIP travel benefits.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </AlertTitle>
    <AlertDescription className="text-destructive/90">
      This owner has no Club benefits, VIP access, or responsible exit options. Ownership is governed by HOA restrictions and limited to the deeded contract.
    </AlertDescription>
  </Alert>
);

const vipPerks: Record<string, string> = {
  'Preferred': 'Standard booking window.',
  'Silver': 'Priority booking & travel discounts.',
  'Gold': 'Enhanced booking, exclusive access & bigger discounts.',
  'Platinum': 'Premium benefits, max discounts & dedicated concierge.',
};

const VipTierDisplay = () => {
  const { state } = useAppContext();
  const { currentVIPLevel } = state;
  
  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <FormLabel className="text-base">VIP Tier Status</FormLabel>
      <div className="mt-2">
        <Badge className={cn("text-base flex items-center gap-2", getTierBadgeClass(currentVIPLevel))}>
            <Sparkles size={16}/>
            {currentVIPLevel}
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">
          {vipPerks[currentVIPLevel] || 'Enter points to see tier perks.'}
        </p>
      </div>
    </div>
  );
};


const OwnerProfileForm = () => {
  const { state, dispatch } = useAppContext();
  const { projectionYears } = state;

  const form = useForm<OwnerProfile>({
    resolver: zodResolver(OwnerProfileSchema),
    defaultValues: state.ownerProfile,
  });

  const { watch, control, setValue, reset, getValues } = form;
  const ownershipType = watch('ownershipType');

  useEffect(() => {
    const ownerProfileString = JSON.stringify(state.ownerProfile);
    if (ownerProfileString !== JSON.stringify(getValues())) {
      reset(state.ownerProfile);
    }
  }, [state.ownerProfile, reset, getValues]);


  const handleFormChange = () => {
      dispatch({ type: 'UPDATE_OWNER_PROFILE', payload: getValues() });
  };
  
  const handleOwnershipTypeChange = (value: typeof ownershipTypes[number]) => {
      setValue('ownershipType', value);
      const newInflationRate = value === 'Deeded Only' ? 8 : 3;
      setValue('mfInflationRate', newInflationRate);

      if (value === 'Deeded Only') {
          setValue('currentPoints', 0);
      } else if (value === 'Capital Club Member') {
          setValue('deedPointValue', 0);
      }
      handleFormChange();
  };

  const handleProjectionYearChange = (value: string) => {
    dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 15 | 20 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Owner Profile & Current Ownership Analysis</CardTitle>
        <CardDescription>Enter the owner's details to project their current financial path and identify opportunities.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
                <Form {...form}>
                    <form onChange={handleFormChange}>
                        <div className="space-y-4">
                             <FormField
                                control={control}
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
                                control={control}
                                name="ownerId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Owner ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="ownershipType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ownership Type</FormLabel>
                                        <Select 
                                            onValueChange={handleOwnershipTypeChange} 
                                            value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ownership type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ownershipTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            {ownershipType === 'Deeded Only' && (
                                <FormField
                                    control={control}
                                    name="deedPointValue"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Deed Point Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 100000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {ownershipType === 'Capital Club Member' ? <VipTierDisplay /> : <DeededOwnerWarning />}

                             {ownershipType === 'Capital Club Member' && (
                                <FormField
                                    control={control}
                                    name="currentPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Club Points</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="150000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             )}

                            <FormField
                                control={control}
                                name="maintenanceFee"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Monthly Maintenance Fee ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="167" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="specialAssessment"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Special Assessment ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                     <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name="mfInflationRate"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>MF Inflation Rate ({field.value}%)</FormLabel>
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

                            <h3 className="font-medium pt-4 border-b pb-2">Optional Loan Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="currentMonthlyLoanPayment"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Monthly Loan Payment ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="250" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="currentLoanTerm"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Remaining Term (Months)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="60" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
            {/* Right Column: Projection */}
            <div>
              <div className="flex justify-end mb-4">
                  <Tabs defaultValue={String(projectionYears)} onValueChange={handleProjectionYearChange} className="w-[270px]">
                      <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="10">10 Years</TabsTrigger>
                          <TabsTrigger value="15">15 Years</TabsTrigger>
                          <TabsTrigger value="20">20 Years</TabsTrigger>
                      </TabsList>
                  </Tabs>
              </div>
              <CurrentOwnershipProjection />
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerProfileForm;

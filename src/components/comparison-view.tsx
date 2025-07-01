'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import CreditCardModule from './credit-card-module';
import ComparisonTable from './comparison-table';
import FinancialTrendGraph from './financial-trend-graph';
import VipBenefitsDisplay from './vip-benefits-display';
import { useAppContext } from '@/contexts/app-context';
import VipValueCalculator from './vip-value-calculator';
import TravelServicesValueCalculator from './travel-services-value-calculator';

const ComparisonView = () => {
  const { state } = useAppContext();
  const { ownerProfile, currentVIPLevel, projectedVIPLevel } = state;

  const currentTierForDisplay = ownerProfile.ownershipType === 'Deeded Only' ? 'Deeded' : currentVIPLevel;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Side-by-Side Comparison</CardTitle>
          <CardDescription>A clear overview of the benefits of upgrading.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonTable />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <VipBenefitsDisplay title="Current Benefits" tier={currentTierForDisplay} />
        <VipBenefitsDisplay title="New Proposal Benefits" tier={projectedVIPLevel} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <FinancialTrendGraph />
        </div>
        <div className="space-y-8">
            <CreditCardModule />
            <TravelServicesValueCalculator />
        </div>
      </div>
      <VipValueCalculator />
    </div>
  );
};

export default ComparisonView;

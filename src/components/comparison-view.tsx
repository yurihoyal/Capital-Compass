'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import CreditCardModule from './credit-card-module';
import ComparisonTable from './comparison-table';
import FinancialTrendGraph from './financial-trend-graph';

const ComparisonView = () => {
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <FinancialTrendGraph />
        </div>
        <div>
            <CreditCardModule />
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;

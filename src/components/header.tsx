'use client';

import React from 'react';
import { Button } from './ui/button';
import { RotateCcw, Building } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export function Header() {
  const { dispatch } = useAppContext();

  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <header className="bg-card border-b shadow-sm no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-foreground">
            My Ownership Blueprint
          </h1>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Tour
        </Button>
      </div>
    </header>
  );
}

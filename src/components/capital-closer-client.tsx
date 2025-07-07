'use client';

import React from 'react';
import { AppProvider } from '@/contexts/app-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from './header';
import OwnerProfileForm from './owner-profile-form';
import RestructureProposalForm from './upgrade-proposal-form';
import AdvantageDashboard from './advantage-calculator';
import ComparisonView from './comparison-view';
import RecapSheet from './recap-sheet';
import AiAssistant from './ai-assistant';
import { ScrollArea } from './ui/scroll-area';

export function CapitalCompassClient() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Tabs defaultValue="owner-profile" className="h-full flex flex-col">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-6 no-print">
                <TabsTrigger value="owner-profile">1. Owner Profile</TabsTrigger>
                <TabsTrigger value="upgrade-proposal">2. Restructure</TabsTrigger>
                <TabsTrigger value="advantage">3. Advantage</TabsTrigger>
                <TabsTrigger value="comparison">4. Compare</TabsTrigger>
                <TabsTrigger value="recap">5. Recap</TabsTrigger>
                <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea className="flex-1 mt-4">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <TabsContent value="owner-profile"><OwnerProfileForm /></TabsContent>
                <TabsContent value="upgrade-proposal"><RestructureProposalForm /></TabsContent>
                <TabsContent value="advantage"><AdvantageDashboard /></TabsContent>
                <TabsContent value="comparison"><ComparisonView /></TabsContent>
                <TabsContent value="recap"><RecapSheet /></TabsContent>
                <TabsContent value="ai-assistant"><AiAssistant /></TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </main>
      </div>
    </AppProvider>
  );
}

'use client';

import React from 'react';
import { AppProvider } from '@/contexts/app-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from './header';
import OwnerProfileForm from './owner-profile-form';
import UpgradeProposalForm from './upgrade-proposal-form';
import ComparisonView from './comparison-view';
import RecapSheet from './recap-sheet';
import AiAssistant from './ai-assistant';
import { ScrollArea } from './ui/scroll-area';

export function CapitalCloserClient() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Tabs defaultValue="owner-profile" className="h-full flex flex-col">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="owner-profile">1. Owner Profile</TabsTrigger>
                <TabsTrigger value="upgrade-proposal">2. Upgrade</TabsTrigger>
                <TabsTrigger value="comparison">3. Compare</TabsTrigger>
                <TabsTrigger value="recap">4. Recap</TabsTrigger>
                <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea className="flex-1 mt-4">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <TabsContent value="owner-profile"><OwnerProfileForm /></TabsContent>
                <TabsContent value="upgrade-proposal"><UpgradeProposalForm /></TabsContent>
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

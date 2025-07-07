'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, Info, Sparkles } from 'lucide-react';
import { getAdvantageSummary } from '@/app/actions';
import { useDebouncedCallback } from 'use-debounce';
import { Skeleton } from './ui/skeleton';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CurrentOwnershipProjection from './current-ownership-projection';
import NewOwnershipProjection from './new-ownership-projection';

const formatCurrency = (value: number) => (value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const AiSummary = () => {
    const { state, dispatch } = useAppContext();
    const { projectionYears, costProjectionData, projectedVIPLevel, showAiSummary } = state;
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const regretGap = useMemo(() => {
        const finalYearData = costProjectionData[costProjectionData.length - 1];
        if (!finalYearData) return 0;
        return finalYearData.currentCost - finalYearData.newCost;
    }, [costProjectionData]);

    const debouncedFetchSummary = useDebouncedCallback(async () => {
        if (!showAiSummary || regretGap <= 0) {
            setSummary('');
            return;
        };
        setIsLoading(true);
        try {
            const result = await getAdvantageSummary({
                years: projectionYears,
                savings: regretGap,
                tier: projectedVIPLevel,
            });
            setSummary(result.summary);
        } catch (error) {
            console.error("Error fetching AI summary:", error);
            setSummary("Could not generate a summary at this time.");
        } finally {
            setIsLoading(false);
        }
    }, 500);

    useEffect(() => {
        debouncedFetchSummary();
    }, [projectionYears, regretGap, projectedVIPLevel, showAiSummary, debouncedFetchSummary]);

    if (!showAiSummary) return null;

    return (
        <div className="mt-6 p-4 border-t border-dashed">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-semibold text-lg">AI-Powered Talking Point</h4>
                </div>
                 <Switch
                    id="ai-summary-toggle"
                    checked={showAiSummary}
                    onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_AI_SUMMARY', payload: checked })}
                />
            </div>
            {isLoading ? (
                <Skeleton className="h-6 w-full" />
            ) : (
                summary && <p className="text-muted-foreground text-base italic">"{summary}"</p>
            )}
        </div>
    );
};

const AdvantageIllustrator = () => {
    const { state, dispatch } = useAppContext();
    const { 
        projectionYears, 
        costProjectionData,
        useRewardsOffset,
        useTravelOffset,
        useOwnerAssistanceOffset,
        rewardsCalculator,
        travelServicesCalculator,
        ownerAssistancePayout
    } = state;

    const chartData = useMemo(() => {
        const finalYearData = costProjectionData[costProjectionData.length - 1];
        if (!finalYearData) return [];
        return [{
            name: `${projectionYears} Years`,
            'Current Path': finalYearData.currentCost,
            'Restructure Path': finalYearData.newCost
        }];
    }, [costProjectionData, projectionYears]);
    
    const regretGap = useMemo(() => {
        const finalYearData = costProjectionData[costProjectionData.length - 1];
        if (!finalYearData) return 0;
        return finalYearData.currentCost - finalYearData.newCost;
    }, [costProjectionData]);


    const SavingsToggle = ({ id, label, checked, onCheckedChange, value, tooltipText }: { id: string, label: string, checked: boolean, onCheckedChange: (checked: boolean) => void, value: number, tooltipText: string }) => (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
                <Label htmlFor={id} className="text-base font-normal">{label}</Label>
                <TooltipProvider>
                    <UiTooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent><p>{tooltipText}</p></TooltipContent>
                    </UiTooltip>
                </TooltipProvider>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-base font-medium text-success">{formatCurrency(value)}</span>
                <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
        </div>
    );

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Advantage Illustrator</CardTitle>
                <CardDescription className="text-lg">Visually compare the long-term costs and discover the value of restructuring.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Chart */}
                    <div className="lg:col-span-3 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip contentStyle={{fontSize: "1rem"}} formatter={(value: number) => formatCurrency(value)} />
                                <Legend wrapperStyle={{fontSize: "1rem"}} />
                                <Bar dataKey="Current Path" fill="hsl(var(--destructive))" radius={[0, 8, 8, 0]} barSize={60} />
                                <Bar dataKey="Restructure Path" fill="hsl(var(--success))" radius={[0, 8, 8, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Toggles & Gap */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-semibold text-center mb-4">Apply Your Savings</h3>
                        
                        <SavingsToggle
                            id="rewards-toggle"
                            label="Rewards Credit Card"
                            checked={useRewardsOffset}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_USE_REWARDS_OFFSET', payload: checked })}
                            value={rewardsCalculator.annualCredit || 0}
                            tooltipText="Annual statement credits from average card usage."
                        />
                         <SavingsToggle
                            id="travel-toggle"
                            label="Travel Services"
                            checked={useTravelOffset}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_USE_TRAVEL_OFFSET', payload: checked })}
                            value={travelServicesCalculator.cashValueOfPoints || 0}
                            tooltipText="Cash value applied toward hotels, cruises, and car rentals."
                        />
                         <SavingsToggle
                            id="assistance-toggle"
                            label="Owner Assistance"
                            checked={useOwnerAssistanceOffset}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_USE_OWNER_ASSISTANCE_OFFSET', payload: checked })}
                            value={ownerAssistancePayout}
                            tooltipText="Potential rental income through Capital’s Owner Assistance Program."
                        />

                        <div className={`mt-6 p-4 rounded-lg text-center transition-all duration-300 ${regretGap > 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'} border`}>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {regretGap > 0 ? 'Total Avoidable Cost' : 'Investment Higher Than Current Path'}
                            </p>
                            <p className={`text-5xl font-bold ${regretGap > 0 ? 'text-success' : 'text-destructive'}`}>
                                {formatCurrency(Math.abs(regretGap))}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Over {projectionYears} years</p>
                        </div>
                    </div>
                </div>
                
                <AiSummary />

            </CardContent>
        </Card>
    );
};


const AdvantageDashboard = () => {
    const { state, dispatch } = useAppContext();
    const { projectionYears } = state;

    const handleProjectionYearChange = (value: string) => {
        dispatch({ type: 'SET_PROJECTION_YEARS', payload: parseInt(value, 10) as 10 | 15 | 20 });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-headline text-3xl">Advantage Dashboard</h2>
                    <p className="text-lg text-muted-foreground">Compare long-term costs and benefits side-by-side.</p>
                </div>
                <Tabs defaultValue={String(projectionYears)} onValueChange={handleProjectionYearChange} className="w-[270px]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="10">10 Years</TabsTrigger>
                        <TabsTrigger value="15">15 Years</TabsTrigger>
                        <TabsTrigger value="20">20 Years</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
                <CurrentOwnershipProjection />
                <NewOwnershipProjection />
            </div>

            <AdvantageIllustrator />
        </div>
    );
};

export default AdvantageDashboard;

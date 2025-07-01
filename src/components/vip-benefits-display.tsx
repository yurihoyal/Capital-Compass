'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Check, XCircle, Star, Info } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type VipTier = 'Deeded' | 'Preferred' | 'Silver' | 'Gold' | 'Platinum' | string;
type BenefitStatus = 'positive' | 'negative' | 'special' | 'neutral';

interface Benefit {
    name: string;
    value: string;
    status: BenefitStatus;
}

interface VipBenefitsDisplayProps {
    tier: VipTier;
    title: string;
}

const benefitsData: Record<string, Benefit[]> = {
    Preferred: [
        { name: 'Booking Window', value: '10 months', status: 'neutral' },
        { name: 'Flex Travel', value: '1 month', status: 'neutral' },
        { name: 'Destinality GO Weeks', value: 'Available', status: 'neutral' },
        { name: 'Guest Certificate Pricing', value: 'Free within 24 hours, $69 per name change', status: 'neutral' },
        { name: 'Point Banking Deadline', value: 'February 28', status: 'neutral' },
        { name: 'Owner Assistance Deadline', value: 'February 28', status: 'neutral' },
        { name: 'Reservation Lead Time', value: '2 days', status: 'neutral' },
        { name: 'Capital Express', value: '7 days', status: 'neutral' },
        { name: 'Capital Access Fee', value: '$0.02 per point', status: 'neutral' },
        { name: 'Points Protection Cost', value: '$150', status: 'neutral' },
        { name: 'Lifestyles Rental Payout', value: '20% value', status: 'neutral' },
        { name: 'Owner Assist Rental Payout', value: '$0.0036 net per point', status: 'neutral' },
        { name: 'Trading/Exchange Rental Payout', value: '$0.01 per point', status: 'neutral' },
    ],
    Silver: [
        { name: 'Reservations Lead Time', value: '11 months', status: 'positive' },
        { name: 'Unit Upgrades', value: 'Not Available', status: 'negative' },
        { name: 'Destinality GO Weeks', value: '4 per year', status: 'positive' },
        { name: 'Capital Flex Travel', value: '2 months', status: 'positive' },
        { name: 'Destinality℠', value: 'Included', status: 'positive' },
        { name: 'Luxury Homes Collection', value: 'Not Available', status: 'negative' },
        { name: 'Travel Services (Cruise/Hotels/Cars)', value: 'Included', status: 'positive' },
        { name: 'Banking Deadline', value: 'Feb 28 – $29.99 fee', status: 'neutral' },
        { name: 'Capital Express', value: '10 days ($0.007/point)', status: 'neutral' },
        { name: 'Capital Access', value: '$0.018/pt', status: 'neutral' },
        { name: 'Owner Assist', value: 'Eligible thru May 31 – $29.99 – $0.0039/pt', status: 'neutral' },
        { name: 'Capital Executive Line', value: 'Not Available', status: 'negative' },
        { name: 'Late Check-Out', value: 'Not Available', status: 'negative' },
        { name: '24-Hour Hold', value: 'Not Available', status: 'negative' },
        { name: 'Sneak Peek', value: 'Not Available', status: 'negative' },
        { name: 'Referral Credits', value: '$300/$500/$700', status: 'positive' },
        { name: 'Points Protection', value: '3% off', status: 'positive' },
        { name: 'Guest Cert Pricing', value: 'Free in 48 hrs ($59/name)', status: 'neutral' },
        { name: 'Aspire Program', value: 'Included', status: 'positive' },
        { name: 'Aspire Banking', value: '25% off', status: 'positive' },
    ],
    Gold: [
        { name: 'Reservations Lead Time', value: '12 months', status: 'positive' },
        { name: 'Unit Upgrades', value: 'Subject to availability, request 10 days out', status: 'special' },
        { name: 'Destinality GO Weeks', value: '6 per year', status: 'positive' },
        { name: 'Capital Flex Travel', value: '4 months', status: 'positive' },
        { name: 'Destinality℠', value: 'Included', status: 'positive' },
        { name: 'Luxury Homes Collection', value: 'Included', status: 'positive' },
        { name: 'Travel Services (Cruise/Hotels/Cars)', value: 'Included', status: 'positive' },
        { name: 'Banking Deadline', value: 'May 31 – $19.99 fee', status: 'neutral' },
        { name: 'Capital Express', value: '14 days', status: 'neutral' },
        { name: 'Capital Access', value: '$0.016/pt', status: 'neutral' },
        { name: 'Owner Assist', value: 'Thru Aug 31 – $19.99 – $0.0042/pt', status: 'neutral' },
        { name: 'Capital Executive Line', value: 'Included', status: 'positive' },
        { name: 'Late Check-Out', value: 'Not Available', status: 'negative' },
        { name: '24-Hour Hold', value: 'Not Available', status: 'negative' },
        { name: 'Sneak Peek', value: 'Not Available', status: 'negative' },
        { name: 'Referral Credits', value: '$300/$500/$700', status: 'positive' },
        { name: 'Points Protection', value: '6% off', status: 'positive' },
        { name: 'Guest Cert Pricing', value: 'Free in 48 hrs ($49/name)', status: 'neutral' },
        { name: 'Aspire Program', value: 'Included', status: 'positive' },
        { name: 'Aspire Banking', value: '40% off', status: 'positive' },
    ],
    Platinum: [
        { name: 'Reservations Lead Time', value: '13 months', status: 'positive' },
        { name: 'Unit Upgrades', value: 'Subject to availability, request 14 days out', status: 'special' },
        { name: 'Destinality GO Weeks', value: 'Unlimited', status: 'positive' },
        { name: 'Capital Flex Travel', value: '6 months', status: 'positive' },
        { name: 'Destinality℠', value: 'Included', status: 'positive' },
        { name: 'Luxury Homes Collection', value: 'Included', status: 'positive' },
        { name: 'Travel Services (Cruise/Hotels/Cars)', value: 'Included', status: 'positive' },
        { name: 'Banking Deadline', value: 'June 30 – $9.99 fee', status: 'neutral' },
        { name: 'Capital Express', value: '21 days', status: 'neutral' },
        { name: 'Capital Access', value: '$0.014/pt', status: 'neutral' },
        { name: 'Owner Assist', value: 'Thru Sept 30 – $9.99 – $0.0045/pt', status: 'neutral' },
        { name: 'Capital Executive Line', value: 'Included', status: 'positive' },
        { name: 'Late Check-Out', value: 'Included', status: 'positive' },
        { name: '24-Hour Hold', value: 'Included', status: 'positive' },
        { name: 'Sneak Peek', value: 'Included (where available)', status: 'positive' },
        { name: 'Referral Credits', value: '$300/$500/$700', status: 'positive' },
        { name: 'Points Protection', value: '10% off', status: 'positive' },
        { name: 'Guest Cert Pricing', value: 'Free in 48 hrs ($39/name)', status: 'neutral' },
        { name: 'Aspire Program', value: 'Included', status: 'positive' },
        { name: 'Aspire Banking', value: '50% off', status: 'positive' },
    ]
};

const tooltipData: Record<string, Record<string, string>> = {
    Silver: {
        'Reservations Lead Time': 'Book up to 11 months in advance — more flexibility than standard deeded ownership.',
        'Unit Upgrades': 'No automatic upgrades included.',
        'Destinality GO Weeks': 'Access to 4 GO weeks per year at special pricing.',
        'Travel Services (Cruise/Hotels/Cars)': 'Use points to book cruises, hotels, resorts, and car rentals through our preferred travel concierge — keeping more cash in your pocket.',
        'Capital Flex Travel': 'Request flexible travel dates up to 2 months out.',
        'Luxury Homes Collection': 'Not available at this tier.',
        'Capital Access': 'Pay $0.018 per point when renting or redeeming.',
        'Owner Assist': 'Eligible through May 31 to deposit up to 50% of unused points for rental.',
        'Guest Cert Pricing': 'Change guest names for $59 within 48 hours of check-in.',
        'Referral Credits': 'Earn up to $700 in annual maintenance fee credits by referring 3 friends or family members.',
        'Aspire Banking': 'Save 25% on Aspire Banking services.',
    },
    Gold: {
        'Reservations Lead Time': 'Book up to 12 months in advance — ideal for peak travel planning.',
        'Unit Upgrades': 'Request unit upgrades 10 days prior to check-in, based on availability.',
        'Destinality GO Weeks': 'Access to 6 GO weeks per year at discounted rates.',
        'Travel Services (Cruise/Hotels/Cars)': 'Use points to book cruises, hotels, resorts, and car rentals through our preferred travel concierge — keeping more cash in your pocket.',
        'Capital Flex Travel': 'Flex travel requests available up to 4 months in advance.',
        'Luxury Homes Collection': 'Access limited Luxury Collection inventory.',
        'Capital Access': 'Pay $0.016 per point — lower cost to rent more points.',
        'Owner Assist': 'Eligible through August 31 with a reduced deposit fee.',
        'Guest Cert Pricing': 'Name changes cost $49 within 48 hours.',
        'Referral Credits': 'Earn up to $700 in annual maintenance fee credits by referring 3 friends or family members.',
        'Aspire Banking': 'Save 40% on Aspire Banking fees.',
    },
    Platinum: {
        'Reservations Lead Time': 'Book up to 13 months in advance — unlock the earliest access to inventory.',
        'Unit Upgrades': 'Request unit upgrades 14 days prior to check-in, based on availability.',
        'Destinality GO Weeks': 'Enjoy unlimited GO weeks — your ticket to more spontaneous travel.',
        'Travel Services (Cruise/Hotels/Cars)': 'Use points to book cruises, hotels, resorts, and car rentals through our preferred travel concierge — keeping more cash in your pocket.',
        'Capital Flex Travel': 'Flex travel requests available up to 6 months out — maximum booking agility.',
        'Luxury Homes Collection': 'Access premium homes in the Luxury Collection.',
        'Capital Access': 'Pay $0.014 per point — our most discounted rate.',
        'Owner Assist': 'Eligible through September 30 with our lowest rental fee and max value.',
        'Guest Cert Pricing': 'Only $39 for guest name changes within 48 hours.',
        'Referral Credits': 'Earn up to $700 in annual maintenance fee credits by referring 3 friends or family members.',
        'Aspire Banking': 'Get 50% off Aspire Banking — our deepest discount.',
    },
};

const DeededAlert = () => (
    <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>No Club Access</AlertTitle>
        <AlertDescription>
            This owner has no access to Club, VIP levels, exit programs, or cost reduction benefits. They are governed by their HOA.
        </AlertDescription>
    </Alert>
);

const BenefitItem = ({ benefit, tier }: { benefit: Benefit; tier: VipTier }) => {
    const iconMap: Record<BenefitStatus, React.ReactNode> = {
        positive: <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />,
        negative: <XCircle className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />,
        special: <Star className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />,
        neutral: <Check className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />,
    };

    const tooltipText = tooltipData[tier]?.[benefit.name];

    return (
        <li className="flex items-start">
            {iconMap[benefit.status]}
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">{benefit.name}</p>
                    {tooltipText && (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{tooltipText}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{benefit.value}</p>
            </div>
        </li>
    );
};

const VipBenefitsDisplay: React.FC<VipBenefitsDisplayProps> = ({ tier, title }) => {
    const tierBenefits = benefitsData[tier];

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
                <CardDescription>Benefits for the {tier} tier</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                    <div className="p-6 pt-0">
                        {tier === 'Deeded' ? (
                            <DeededAlert />
                        ) : (
                            tierBenefits ? (
                                <ul className="space-y-3">
                                    {tierBenefits.map(benefit => (
                                        <BenefitItem key={benefit.name} benefit={benefit} tier={tier} />
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Benefit information not available for this tier.</p>
                            )
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default VipBenefitsDisplay;

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Check, XCircle } from 'lucide-react';

type VipTier = 'Deeded' | 'Preferred' | 'Silver' | 'Gold' | 'Platinum' | string;

interface VipBenefitsDisplayProps {
    tier: VipTier;
    title: string;
}

const benefitsData: Record<string, { name: string, value: string }[]> = {
    Preferred: [
        { name: 'Booking Window', value: '10 months' },
        { name: 'Flex Travel', value: '1 month' },
        { name: 'Destinality GO Weeks', value: 'Available' },
        { name: 'Guest Certificate Pricing', value: 'Free within 24 hours, $69 per name change' },
        { name: 'Point Banking Deadline', value: 'February 28' },
        { name: 'Owner Assistance Deadline', value: 'February 28' },
        { name: 'Reservation Lead Time', value: '2 days' },
        { name: 'Capital Express', value: '7 days' },
        { name: 'Capital Access Fee', value: '$0.02 per point' },
        { name: 'Points Protection Cost', value: '$150' },
        { name: 'Lifestyles Rental Payout', value: '20% value' },
        { name: 'Owner Assist Rental Payout', value: '$0.0036 net per point' },
        { name: 'Trading/Exchange Rental Payout', value: '$0.01 per point' },
    ],
    Silver: [
        { name: 'Booking Window', value: '11 months' },
        { name: 'Flex Travel', value: 'Enhanced' },
        { name: 'Guest Certificate Pricing', value: 'Discounted' },
        { name: 'Point Banking Deadline', value: 'Extended' },
        { name: 'Rental Payouts', value: 'Improved rates' },
        { name: 'VIP Support', value: 'Priority access' },
    ],
    Gold: [
        { name: 'Booking Window', value: '12 months' },
        { name: 'Exclusive Access', value: 'Access to premium resorts' },
        { name: 'Guest Certificate Pricing', value: 'Further discounts' },
        { name: 'Point Banking', value: 'Greater flexibility' },
        { name: 'Rental Payouts', value: 'Higher payout rates' },
        { name: 'Dedicated Support', value: 'Gold-level concierge' },
    ],
    Platinum: [
        { name: 'Booking Window', value: '12+ months priority' },
        { name: 'Premium Benefits', value: 'All-inclusive access & upgrades' },
        { name: 'Guest Privileges', value: 'Complimentary guest certificates' },
        { name: 'Point Banking', value: 'Maximum flexibility' },
        { name: 'Rental Payouts', value: 'Highest possible rates' },
        { name: 'Dedicated Concierge', value: 'Personalized service' },
    ]
};

const DeededAlert = () => (
    <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>No Club Access</AlertTitle>
        <AlertDescription>
            This owner has no Club access, no VIP status, no Capital Points banking, and no responsible exit program. They are fully governed by their HOA deed contract.
        </AlertDescription>
    </Alert>
);


const VipBenefitsDisplay: React.FC<VipBenefitsDisplayProps> = ({ tier, title }) => {
    const tierBenefits = benefitsData[tier];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
                <CardDescription>Benefits for the {tier} tier</CardDescription>
            </CardHeader>
            <CardContent>
                {tier === 'Deeded' ? (
                    <DeededAlert />
                ) : (
                    tierBenefits ? (
                         <ul className="space-y-3">
                            {tierBenefits.map(benefit => (
                                <li key={benefit.name} className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">{benefit.name}</p>
                                        <p className="text-sm text-muted-foreground">{benefit.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">Benefit information not available for this tier.</p>
                    )
                )}
            </CardContent>
        </Card>
    );
};

export default VipBenefitsDisplay;

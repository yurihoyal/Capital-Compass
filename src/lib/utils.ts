import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTierBadgeClass = (tier: string) => {
    switch (tier) {
        case 'Platinum':
            return 'bg-success text-success-foreground hover:bg-success/90 border-transparent';
        case 'Gold':
            return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-transparent';
        case 'Silver':
            return 'bg-foreground text-background hover:bg-foreground/90 border-transparent';
        case 'Preferred':
        default:
            return 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent';
    }
};

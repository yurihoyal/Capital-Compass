import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTierBadgeClass = (tier: string) => {
    switch (tier) {
        case 'Platinum':
            return 'bg-success text-foreground hover:bg-success/90 border-transparent'; // Fresh Teal
        case 'Gold':
            return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-transparent'; // Picton Blue
        case 'Silver':
            return 'bg-border text-primary-foreground hover:bg-border/90 border-transparent'; // Pamper Teal Gray
        case 'Preferred':
        default:
            return 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent'; // Sea Blue
    }
};

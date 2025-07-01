import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTierBadgeClass = (tier: string) => {
    switch (tier) {
        case 'Platinum':
            return 'bg-gray-300 text-gray-800 hover:bg-gray-300/80 border-transparent';
        case 'Gold':
            return 'bg-yellow-400 text-black hover:bg-yellow-400/80 border-transparent';
        case 'Silver':
            return 'bg-slate-400 text-black hover:bg-slate-400/80 border-transparent';
        case 'Preferred':
        default:
            return 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent';
    }
};

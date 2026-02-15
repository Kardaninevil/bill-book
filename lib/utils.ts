
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberToWords(amount: number): string {
  // Basic implementation or placeholder. 
  // For production, suggest using a library like 'number-to-words'
  return `${amount} Only`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard enterprise currency formatter for Kenyan Shilling (KES).
 * Formats numbers into clear, readable strings like: "KES 1,250,000" or "KES 850.50".
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = "KES",
  maximumFractionDigits = 0
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency} 0`;
  }

  // Format currency with standard Kenyan locale grouping
  const formattedNumber = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(amount);

  return `${currency} ${formattedNumber}`;
}

export function formatKES(amount: number | null | undefined): string {
  return formatCurrency(amount, "KES", 0);
}

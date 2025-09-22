import numeral from 'numeral';
import { format, parseISO } from 'date-fns';

/**
 * Format currency with proper Indonesian Rupiah formatting
 */
export function formatCurrency(amount: number): string {
  return numeral(amount).format('0,0');
}

/**
 * Format currency with Rupiah symbol
 */
export function formatRupiah(amount: number): string {
  return `Rp ${formatCurrency(amount)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return numeral(value / 100).format(`0,0.${'0'.repeat(decimals)}%`);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(amount: number): string {
  return numeral(amount).format('0.0a').toUpperCase();
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
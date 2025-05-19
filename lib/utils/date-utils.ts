import { format, formatDistance, parseISO, addMonths, addDays, isAfter, differenceInDays } from 'date-fns';

/**
 * Format a date string for display
 */
export function formatDate(dateString: string, formatString: string = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date relative to today (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
}

/**
 * Get the next billing date based on billing cycle
 */
export function getNextBillingDate(
  startDate: string,
  billingCycle: 'monthly' | 'quarterly' | 'biannual' | 'annual'
): string {
  const date = parseISO(startDate);
  
  switch (billingCycle) {
    case 'monthly':
      return addMonths(date, 1).toISOString();
    case 'quarterly':
      return addMonths(date, 3).toISOString();
    case 'biannual':
      return addMonths(date, 6).toISOString();
    case 'annual':
      return addMonths(date, 12).toISOString();
    default:
      return addMonths(date, 1).toISOString();
  }
}

/**
 * Check if a subscription payment is due soon
 */
export function isPaymentDueSoon(nextBillingDate: string, daysThreshold: number = 7): boolean {
  const billingDate = parseISO(nextBillingDate);
  const thresholdDate = addDays(new Date(), daysThreshold);
  
  return isAfter(thresholdDate, billingDate);
}

/**
 * Get days until next billing date
 */
export function getDaysUntilBilling(nextBillingDate: string): number {
  const billingDate = parseISO(nextBillingDate);
  const today = new Date();
  return differenceInDays(billingDate, today);
}

/**
 * Get month name from date
 */
export function getMonthName(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM');
  } catch (error) {
    console.error('Error getting month name:', error);
    return 'Invalid month';
  }
}

/**
 * Get formatted month and year
 */
export function getMonthYear(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM yyyy');
  } catch (error) {
    console.error('Error getting month and year:', error);
    return 'Invalid date';
  }
}
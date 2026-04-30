import { CURRENCY_DECIMAL_PLACES, CURRENCY_SYMBOL } from "@/constants";

/**
 * Format a numeric amount as an INR currency string.
 * Always use this — never use .toFixed() or inline ₹ symbols.
 *
 * @example formatCurrency(149.5) → "₹149.50"
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(CURRENCY_DECIMAL_PLACES)}`;
}

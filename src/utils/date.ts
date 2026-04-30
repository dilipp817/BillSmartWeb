/**
 * Format a date value as a localised date+time string for display in the POS UI.
 * Output: "30/04/2026, 14:35" (DD/MM/YYYY, HH:mm — 24-hour, IST-friendly)
 *
 * Accepts a Date object, ISO string, or Unix epoch milliseconds.
 * Always use this — never inline new Date().toLocaleString() calls.
 *
 * @example formatDate("2026-04-30T09:05:00Z") → "30/04/2026, 14:35"
 */
export function formatDate(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format a date value as a date-only string (no time component).
 * Output: "30/04/2026"
 *
 * @example formatDateOnly("2026-04-30T09:05:00Z") → "30/04/2026"
 */
export function formatDateOnly(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

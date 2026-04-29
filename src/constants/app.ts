// Polling intervals (ms)
export const POLL_INTERVAL_ORDERS = 15_000;
export const POLL_INTERVAL_TABLES = 30_000;

// Tax — 18% GST (9% CGST + 9% SGST). Never read from API.
export const TAX_RATE_TOTAL = 0.18;
export const TAX_RATE_CGST = 0.09;
export const TAX_RATE_SGST = 0.09;

// Currency
export const CURRENCY_CODE = "INR";
export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_DECIMAL_PLACES = 2;

// Auth
export const TOKEN_LIFETIME_SECONDS = 86_400; // 24 hours — JWT is non-renewable; re-login required
export const TOKEN_VALIDATION_THROTTLE_MS = 60_000; // max one validate call per minute on tab focus

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Payment
export const PAYMENT_REF_PREFIX = "PAY";

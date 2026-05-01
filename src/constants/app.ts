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
export const TOKEN_COOKIE = "bs_token"; // httpOnly cookie name — must match proxy route
export const AUTH_LOGIN_PATH = "/api/v1/auth/login"; // backend login endpoint path
export const AUTH_LOGOUT_PATH = "/api/v1/auth/logout"; // proxy clears httpOnly cookie on this path
export const DEVICE_TYPE = "web"; // sent with every login request; never changes for the web client
export const DEVICE_ID_KEY = "bs_device_id"; // localStorage key for the stable browser device identifier

// Feature Flags
export const FLAG_REFETCH_THROTTLE_MS = 15 * 60 * 1_000; // re-fetch at most once every 15 minutes on tab focus

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Payment
export const PAYMENT_REF_PREFIX = "PAY";

// Print Agent — local Node.js bridge between the web app and the thermal printer
export const PRINT_AGENT_DEFAULT_PORT = 6868;
export const PRINT_AGENT_DEFAULT_URL = `http://localhost:${PRINT_AGENT_DEFAULT_PORT}`;
/** Timeout (ms) for all requests to the Print Agent. */
export const PRINT_AGENT_TIMEOUT_MS = 5_000;
/** localStorage key for the persisted printer settings (agent URL). Per-device, not per-user. */
export const PRINTER_SETTINGS_STORAGE_KEY = "bs_printer_settings";

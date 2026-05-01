# BillSmart Web — Production Readiness Report

**Generated:** May 2026  
**Reviewer:** Full codebase review (~100 files)  
**Verdict:** ⚠️ Not yet production-ready — critical gaps listed below

---

## Tracking Summary

| #   | Issue                            | Status                                                                  | Branch                         |
| --- | -------------------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| 1   | ReactQueryDevtools in production | ✅ Fixed                                                                | `fix/providers-devtools-guard` |
| 2   | API_INTERNAL_SECRET unused       | ⏸️ Deferred — needs backend to implement `X-Internal-Secret` validation | —                              |
| 3   | No error boundaries              | ✅ Fixed                                                                | `fix/app-error-boundary`       |
| 4   | Dashboard stats null             | ✅ Fixed                                                                | `fix/dashboard-today-stats`    |
| 5   | Zero tests on payment path       | ⏸️ Deferred — post-launch sprint                                        | —                              |
| 6   | Print Agent HTTP/HTTPS           | ✅ Non-issue — Chrome/Edge allow HTTPS→localhost                        | —                              |
| 7   | No observability (Sentry)        | ⏸️ Deferred — set up before go-live                                     | —                              |
| 8   | Food editing disabled            | ⏸️ Blocked — backend `PUT /api/v1/foods/{id}` not implemented           | —                              |

### Pending Action Items

**Before go-live (frontend):**

- [ ] Set up Sentry — create account at sentry.io, install `@sentry/nextjs`, add `SENTRY_DSN` to env

**Needs backend coordination:**

- [ ] `API_INTERNAL_SECRET` — backend must validate `X-Internal-Secret` header; then wire frontend proxy to send it
- [ ] Food editing — backend must implement `PUT /api/v1/foods/{id}`

**Post-launch:**

- [ ] Write unit tests: `generatePaymentRef()`, `computeSalesReport()`, cart store, offline queue

---

## ✅ What Is Production-Grade

| Category                                                                                  | Status                                                  |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)                         | ✅ Configured in `next.config.ts`, strict in production |
| Auth architecture (httpOnly cookie, backend URL never in browser)                         | ✅                                                      |
| Payment reliability (idempotency keys, no optimistic updates, buttons disabled in-flight) | ✅                                                      |
| TypeScript strictness (no `any`, all enums, all typed)                                    | ✅                                                      |
| Role-based access control (`<RoleGuard>`, enum comparisons only)                          | ✅                                                      |
| Offline queue (IndexedDB + sync on reconnect)                                             | ✅                                                      |
| PWA (service worker, manifest, installable)                                               | ✅                                                      |
| Token validation on mount + tab focus (throttled)                                         | ✅                                                      |
| CSP `connect-src 'self'` — blocks direct browser-to-backend calls                         | ✅                                                      |
| Open-redirect prevention on `/login?from=`                                                | ✅                                                      |

---

## ❌ Gaps — Must Fix Before Production

### 1. ReactQueryDevtools Ships to Production (Data Leak)

**File:** `src/components/providers.tsx`  
**Severity:** HIGH — exposes all query keys, cached API responses, and request payloads in browser devtools. Financial data visible to anyone with DevTools open.

**Fix:**

```tsx
// providers.tsx
{
  process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />;
}
```

---

### 2. `API_INTERNAL_SECRET` Declared But Never Used (Dead Security Code)

**File:** `src/env.ts`, `src/app/api/[...proxy]/route.ts`  
**Severity:** MEDIUM — creates false confidence that server-to-server calls are authenticated when they are not. Either implement it or remove it.

**Fix options:**

- **Remove it**: Delete `API_INTERNAL_SECRET` from `env.ts` and `.env.example`
- **Implement it**: In the proxy route, read `env.API_INTERNAL_SECRET` and set it as an `X-Internal-Secret` header on every request to the Spring Boot backend. Backend validates this header.

---

### 3. No Error Boundaries (White-Screen on Render Errors)

**File:** None — missing entirely  
**Severity:** HIGH — any unhandled error in a React component during render crashes the entire app. At a busy POS counter this means the cashier is locked out with a blank screen until a hard refresh.

**Fix:** Add `<ErrorBoundary>` wrappers at minimum:

- Around the authenticated app shell (`src/app/(authenticated)/layout.tsx`)
- Around each major page (orders, billing, tables)
- Use `react-error-boundary` package or a custom fallback component

---

### 4. Dashboard Stats Permanently Showing "—"

**File:** `src/features/dashboard/hooks/use-dashboard-stats.ts`  
**Severity:** MEDIUM — `todayOrderCount` and `todayRevenue` are always `null`. The comments say "Wired after O-02 is merged" but all phases are merged. The dashboard shows placeholder dashes on the "Today's Orders" and "Today's Revenue" cards indefinitely.

**Fix:** Wire up the missing stats using the existing `listOrdersByDateRange` service call to compute today's order count and revenue.

---

### 5. Zero Test Coverage on Payment Path

**File:** `src/test/` — only `use-sidebar-nav-items.test.ts` exists  
**Severity:** HIGH — the entire payment flow (idempotency, record payment, process card payment, bill generation) has no automated tests. A financial app without payment path tests is not production-safe.

**Minimum tests needed:**

- `generatePaymentRef()` — uniqueness and format
- `useRecordPayment` — idempotency key persists across retries
- `computeSalesReport()` — CANCELLED orders excluded from revenue
- `enqueueOrder()` / `useOfflineSyncEffect()` — offline queue correctness
- Cart store — add/remove/quantity/clear

---

### 6. Print Agent HTTP vs HTTPS Mixed-Content Block

**File:** `src/constants/app.ts` — `PRINT_AGENT_DEFAULT_URL = "http://localhost:6868"`  
**Severity:** MEDIUM — when the app is served over HTTPS in production, the browser will block requests to `http://localhost:6868` as mixed-content. All printing will silently fail for every user.

**Fix options:**

- Document that the Print Agent must be run behind a local HTTPS reverse proxy (e.g. `mkcert` + nginx)
- Or add a note in the Settings UI that printing only works on HTTP deployments or with a local HTTPS bridge
- Or set `Content-Security-Policy: connect-src 'self' http://localhost:6868` for localhost exemption (not universally respected)

---

### 7. No Observability (Errors Are Silent in Production)

**Severity:** HIGH — when a payment fails, a bill generation fails, or an offline sync fails in production, there is no mechanism to alert the development team. Bugs can persist for days undetected.

**Fix:** Add at minimum:

- **Sentry** (or equivalent): Install `@sentry/nextjs`, configure DSN in env, wrap the app. Captures unhandled exceptions and promise rejections.
- **Structured logging**: Log payment creation/failure events server-side in the proxy route

---

### 8. Food Item Editing Permanently Disabled

**File:** `src/features/menu/hooks/use-food-form.ts`  
**Severity:** LOW — admins can add and delete food items but cannot edit them (price, name, category, description). The Save button is unconditionally disabled in edit mode.

**Root cause:** Backend `PUT /api/v1/foods/{id}` endpoint not yet implemented (per `BILLSMART_BACKEND_MASTER.md`).

**Status:** Blocked on backend. No frontend fix needed until backend implements the endpoint.

---

## Priority Order for Fixes

| #   | Issue                            | Effort             | Priority                           |
| --- | -------------------------------- | ------------------ | ---------------------------------- |
| 1   | ReactQueryDevtools in production | 1 line             | 🔴 Critical — do before any deploy |
| 2   | Error boundaries                 | 1–2 hours          | 🔴 Critical                        |
| 3   | No observability (Sentry)        | 2–4 hours          | 🔴 Critical                        |
| 4   | Payment path tests               | 1–2 days           | 🟠 High                            |
| 5   | API_INTERNAL_SECRET unused       | 30 min             | 🟠 High                            |
| 6   | Dashboard stats null             | 2–3 hours          | 🟡 Medium                          |
| 7   | Print Agent HTTP/HTTPS           | Documentation      | 🟡 Medium                          |
| 8   | Food edit disabled               | Blocked on backend | 🟢 Low                             |

---

## Code Quality Findings (Fixed)

Two violations were found during the codebase review and fixed:

### Fixed: `table-service.ts` — Enum type safety

**File:** `src/features/tables/services/table-service.ts`  
`listTablesByStatus()` and `updateTableStatus()` accepted `string` instead of `TableStatus`. Fixed to use the `TableStatus` enum.

### Fixed: `print-button.tsx` — Printer settings URL ignored

**File:** `src/features/print/components/print-button.tsx`  
`PrintButton` was always using the hardcoded default `localhost:6868` URL, ignoring the operator-configured URL in `usePrinterSettingsStore`. Fixed to read the URL from the store.

---

_All other ~100 files reviewed: architecture/layer separation, TypeScript strictness, security rules, payment reliability, role guards, feature flags, currency formatting, polling, error handling, naming conventions — all clean._

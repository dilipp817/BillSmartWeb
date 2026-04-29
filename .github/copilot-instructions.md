# BillSmart Web — Copilot Instructions

## Project Context

BillSmart is a **financial POS system** for restaurants. Errors cost real money and affect real customers waiting at a counter. Reliability and security take priority over everything else.

## Reference Documents

- Backend API contract: `src/test/BILLSMART_BACKEND_MASTER.md`
- Web team scope & screens: `src/test/WEB_TEAM_CONTEXT.md`

---

## Architecture

### Layer Order (never skip or reverse)

```
Component (JSX only — no API calls, no business logic)
    ↓
Custom Hook (state + logic — the "ViewModel")
    ↓
Service (API calls only — e.g. orderService.ts)
    ↓
Axios instance (lib/axios.ts — auth headers, error handling)
```

### Folder Structure

```
src/
  features/<name>/
    components/   ← feature UI (dumb components)
    hooks/        ← useXxx hooks (state + logic)
    services/     ← API calls
    types/        ← DTOs and request/response types
    utils/        ← feature-specific helpers
  components/     ← shared reusable UI components
  hooks/          ← shared hooks (usePolling, useFeatureFlag)
  lib/            ← axios instance, queryClient, dexie db
  store/          ← zustand stores (auth, feature flags, UI)
  types/          ← shared types (ApiResponse, PaginatedResponse)
  utils/          ← shared pure utilities
  constants/      ← enums, magic-value-free constants
```

---

## Strict Rules

### TypeScript

- `strict: true` — no `any`, ever. Use `unknown` and narrow it.
- Every API response must be typed with an interface or type — never inferred as `any`
- All enums defined in `src/constants/`:
  ```ts
  export enum OrderStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    HOLD = "HOLD",
    COMPLETED = "COMPLETED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
  }
  export enum UserRole {
    STAFF = "staff",
    MANAGER = "manager",
    ADMIN = "admin",
  }
  export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    UPI = "UPI",
    WALLET = "WALLET",
  }
  ```
- Never compare roles or statuses with raw strings: `role === UserRole.ADMIN` not `role === 'admin'`

### No Magic Values

```ts
// ❌ Never
setTimeout(poll, 15000);
if (role === "admin") amount.toFixed(2) + " INR";

// ✅ Always
setTimeout(poll, POLL_INTERVAL_ORDERS);
if (role === UserRole.ADMIN) formatCurrency(amount);
```

### Currency & Tax

- Always format currency with `formatCurrency()` from `src/utils/currency.ts` — never inline
- Tax is always 18% (9% CGST + 9% SGST) — hardcoded, never from API
- Never compute `paid_amount` or `remaining_amount` client-side — read from bill response

---

## Security Rules

### Authentication

- JWT stored in **httpOnly cookie only** — never `localStorage`, never `sessionStorage`
- Backend URL never exposed to the browser — all API calls go through Next.js API routes (`/api/...`)
- On any 401 response → clear session and redirect to `/login` immediately

### Role Guards

- Role checks in the UI are for UX only (hiding buttons) — never skip backend calls
- Use the `<RoleGuard>` component — never scatter `if (role === ...)` across JSX
- `staff` must never see cancel order, discount, or admin screens

### Input Validation

- Every form validated with Zod before any API call
- Monetary inputs: must be positive, max 2 decimal places

---

## Reliability Rules (Financial App — Critical)

### Payments — never optimistic

- Never update payment/bill UI before server confirms success
- Always persist `reference_number` before the network call (idempotency key)
- Every payment button must be disabled while in-flight — no double submissions

### Order creation — never optimistic

- Wait for server response before navigating away or clearing cart

### Error handling

- Never empty `catch` blocks — every API error must show a user-facing message
- Network errors → toast with message
- 401 → redirect to login
- 403 → show "Permission denied" toast, do not navigate
- 409 (conflict) → show specific message (e.g. "Table is already occupied")

---

## Component Rules

### Server vs Client (Next.js App Router)

- Default to **Server Components** — no `"use client"` unless you need interactivity
- Data fetching → Server Component or TanStack Query in Client Component
- `"use client"` only for: `useState`, `useEffect`, event handlers, browser APIs

### Reusability

- If a UI pattern appears more than once → extract to `src/components/`
- Props must be typed with explicit interfaces — no inline prop types on reused components
- shadcn/ui components are the base — extend, don't rewrite

---

## State Management Rules

- **TanStack Query** = all server data (orders, foods, bills, tables)
- **Zustand** = client-only state (auth session, feature flags, sidebar open/closed)
- Never put API response data in Zustand — that is TanStack Query's job
- `queryClient.invalidateQueries()` must always have a specific key — never call with no args

---

## Naming Conventions

| Thing               | Convention                                          | Example                          |
| ------------------- | --------------------------------------------------- | -------------------------------- |
| Components          | PascalCase                                          | `OrderCard.tsx`                  |
| Hooks               | camelCase, `use` prefix                             | `useOrders.ts`                   |
| Services            | camelCase, `Service` suffix                         | `orderService.ts`                |
| Types/Interfaces    | PascalCase, no `I` prefix                           | `OrderDto`, `CreateOrderRequest` |
| Zustand stores      | camelCase, `use` + `Store` suffix                   | `useAuthStore.ts`                |
| Utils               | camelCase                                           | `formatCurrency.ts`              |
| Constants/Enums     | PascalCase for enum, SCREAMING_SNAKE_CASE for const | `OrderStatus`, `MAX_PAGE_SIZE`   |
| Non-component files | kebab-case                                          | `order-service.ts`               |

---

## Polling Rules

- Polling managed by a shared `usePolling(fn, interval)` hook
- Always start on mount/focus, stop on unmount/blur
- Intervals from constants only: `POLL_INTERVAL_ORDERS = 15_000`, `POLL_INTERVAL_TABLES = 30_000`

## Feature Flags

- Load once after login, stored in `useFeatureFlagStore` (Zustand)
- Never call the flags API mid-flow
- Always use `useFeatureFlag('flag_name')` hook — never read store directly in components
- If flag is `false` → **hide** the feature entirely, do not just disable it

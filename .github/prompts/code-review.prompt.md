---
description: "Review staged/changed code against BillSmart coding guidelines before git push. Checks architecture, security, reliability, naming, TypeScript strictness, and POS-specific rules."
name: "BillSmart Code Review"
argument-hint: "Optionally name a specific file or feature to review"
agent: "agent"
tools: [search, read_file, get_changed_files]
---

You are a senior code reviewer for **BillSmart** — a financial POS system for restaurants. Errors in this app cost real money and affect real customers.

Review all recently changed files against the guidelines in [copilot-instructions.md](../copilot-instructions.md).

## Review Checklist

Go through each changed file and check every item below. Report violations clearly with: file path, line number (if known), what the violation is, and how to fix it.

---

### 1. Architecture & Layer Separation

- [ ] Components contain JSX only — no direct API calls, no axios imports, no fetch calls
- [ ] All API calls are in `services/` files only
- [ ] All state + logic is in custom hooks (`useXxx`) — not inline in components
- [ ] No business logic scattered across multiple layers
- [ ] Layer order respected: Component → Hook → Service → Axios

### 2. TypeScript Strictness

- [ ] No `any` type used anywhere — use `unknown` and narrow it
- [ ] Every API response is typed with an explicit interface or type
- [ ] No implicit `any` from untyped function parameters
- [ ] Props interfaces are explicitly defined — no inline `{ prop: type }` on reused components

### 3. No Magic Values

- [ ] No hardcoded role strings: `'admin'`, `'staff'`, `'manager'` — must use `UserRole` enum
- [ ] No hardcoded status strings: `'PENDING'`, `'PAID'`, etc. — must use enums
- [ ] No hardcoded poll intervals (e.g. `15000`) — must use `POLL_INTERVAL_ORDERS`, `POLL_INTERVAL_TABLES`
- [ ] No hardcoded tax rate (e.g. `0.18`, `18`) inline — must use `TAX_RATE` constant
- [ ] No inline currency formatting — must use `formatCurrency()` from `src/utils/currency.ts`

### 4. Security Rules

- [ ] JWT is never stored in `localStorage` or `sessionStorage`
- [ ] Backend URL is never referenced in client-side code — only via Next.js API routes (`/api/...`)
- [ ] Role checks never replace backend calls — only used for hiding UI elements
- [ ] Every form validated with Zod before any API call
- [ ] No `dangerouslySetInnerHTML` without explicit sanitisation

### 5. Reliability Rules (Financial — Critical)

- [ ] Payment buttons are disabled while the API call is in-flight
- [ ] `reference_number` is generated and persisted BEFORE the payment network call
- [ ] No optimistic UI updates on payment or order creation — wait for server response
- [ ] Cart is NOT cleared before server confirms order creation success
- [ ] No empty `catch` blocks — every error must show a user-facing message

### 6. Error Handling

- [ ] 401 responses → clear session + redirect to `/login`
- [ ] 403 responses → "Permission denied" toast, no navigation
- [ ] 409 responses → specific conflict message shown to user
- [ ] Network errors → toast with message
- [ ] No silently swallowed errors

### 7. Role Guards & Permissions

- [ ] Cancel order button/screen not visible to `staff` role
- [ ] Discount field not visible to `staff` role
- [ ] Admin-only screens (`menu management`, `table CRUD`) not accessible to `staff` or `manager`
- [ ] `<RoleGuard>` component used — no scattered `if (role === ...)` in JSX

### 8. State Management

- [ ] API response data is NOT stored in Zustand — TanStack Query only
- [ ] Zustand stores only hold: auth session, feature flags, UI state
- [ ] `queryClient.invalidateQueries()` always called with a specific key — never empty

### 9. Feature Flags

- [ ] Feature flags read via `useFeatureFlag()` hook — never direct store access in components
- [ ] When a flag is `false` → feature is hidden entirely, not just disabled
- [ ] Flags not fetched mid-flow — only loaded once after login

### 10. Component Rules (Next.js App Router)

- [ ] `"use client"` only used where truly needed (useState, useEffect, event handlers)
- [ ] No unnecessary `"use client"` on components that could be Server Components
- [ ] Reused UI patterns are in `src/components/` — not duplicated across feature folders

### 11. Naming Conventions

- [ ] Components: PascalCase `.tsx`
- [ ] Hooks: `useXxx.ts` camelCase
- [ ] Services: `xxxService.ts` or `xxx-service.ts`
- [ ] Types/Interfaces: PascalCase, no `I` prefix
- [ ] Zustand stores: `useXxxStore.ts`
- [ ] Non-component files: kebab-case

### 12. Currency & Tax Display

- [ ] All amounts displayed using `formatCurrency()` — never `.toFixed(2)` inline
- [ ] `paid_amount` and `remaining_amount` read from bill API response — never computed client-side
- [ ] CGST and SGST always displayed as 9% each — never calculated on client

### 13. Polling

- [ ] Polling uses shared `usePolling(fn, interval)` hook
- [ ] Polling starts on mount/focus, stops on unmount/blur
- [ ] Interval values from constants only

---

## Output Format

For each violation found, report:

```
❌ [FILE PATH]
   Rule: <which rule above>
   Issue: <what is wrong>
   Fix: <exactly what to change>
```

If no violations found:

```
✅ All guidelines followed. Ready to push.
```

At the end, give a summary:

- Total violations found
- Verdict: READY TO PUSH ✅ or NEEDS FIXES ❌

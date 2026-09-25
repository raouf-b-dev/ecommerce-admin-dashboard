# E-commerce Admin Dashboard: Roadmap

> Delivery plan for the admin SPA. Work top to bottom.
>
> Companions: [README.md](../README.md), [API-INTEGRATION.md](API-INTEGRATION.md), [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api), [ecommerce-store-web](https://github.com/raouf-b-dev/ecommerce-store-web).

---

## How to use this file

- `[ ]` not started
- `[/]` in progress
- `[x]` done
- Finish each phase before starting the next. See **Next up** for the live queue.
  - **Phase 12** (payments) is optional: skip it or do it after the already-done Phase 13 gate.
  - Remaining **Phase 12.5** polish does not block Phase 12 or 14.
- Keep domain rules and auth enforcement in the API.
- Contracts: live OpenAPI/Swagger + generated client. [API-INTEGRATION.md](API-INTEGRATION.md) is client rules only (not an endpoint list).

## Next up

Pick the first unchecked work. Letter suffixes (`8a`, `8b`, `8c`) are stable IDs - do not renumber them.

1. **Finish Phase 12.5** - visual finish (chart tooltip, font, favicon, product thumbnails and image preview), then optional Cmd+K and trend badges.
2. **Phase 12** - Payments ops (optional; does **not** block the already-done Phase 13 gate).
3. **Phase 14** - Dashboard operational facts (blocked on OpenAPI operational fields).

---

## Testing policy

Write tests **with** each feature.

| Layer                 | When                                                  |
| :-------------------- | :---------------------------------------------------- |
| Unit / component      | Same phase as the UI                                  |
| Playwright            | Extend smoke when the feature joins the critical path |
| Cross-cutting quality | Phase 8 only                                          |

## Definition of done (every feature phase)

1. Wired to OpenAPI operations for that phase's capabilities.
2. Listed tests green.
3. Lint + typecheck clean.
4. RBAC: UI may hide controls; API remains the authority.
5. Integration doc still accurate for that phase.

---

## Stack

| Concern        | Choice                                        |
| :------------- | :-------------------------------------------- |
| App            | Vite + React 19 + TypeScript strict           |
| Routing        | React Router                                  |
| Styling        | Tailwind CSS + shadcn/ui                      |
| Client data    | TanStack Query                                |
| Tables         | TanStack Table                                |
| Local UI state | React state; Zustand when needed across trees |
| Forms          | React Hook Form + Zod                         |
| Charts         | Recharts (dashboard widgets)                  |
| API            | Typed client from OpenAPI / Swagger           |
| Tests          | Vitest + Testing Library + Playwright         |

**Ports:** admin `5174`, API `3000` (or remapped API `PORT` on hosts that reserve `3000-3199`).

---

## Completed phases

> Full checklists for finished phases are collapsed. History is in git. IDs stay; do not renumber.

| Phase    | Name                               | Status | Focus                                                                           |
| -------- | ---------------------------------- | ------ | ------------------------------------------------------------------------------- |
| **0**    | Foundation                         | Done   | Vite scaffold, tooling, tests, OpenAPI client                                   |
| **1**    | Agent ecosystem and conventions    | Done   | AGENT policy, context, AI docs, adapters                                        |
| **1.5**  | Shell and page structure           | Done   | Layout extraction, feature pages, responsive nav, auth route shape              |
| **2**    | Auth and RBAC chrome               | Done   | Login, permission-aware nav + tests                                             |
| **2.5**  | Forced password change             | Done   | `/change-password`, session flag, API guard integration                         |
| **2.6**  | Operator gate + silent refresh     | Done   | Operators-only SPA; domain 401 one-shot refresh                                 |
| **3**    | Products                           | Done   | Table/forms + tests                                                             |
| **4**    | Inventory                          | Done   | Stock views + tests                                                             |
| **5**    | Orders                             | Done   | Ops actions + tests                                                             |
| **6**    | Users                              | Done   | Read views + role filter + tests                                                |
| **7**    | Dashboard                          | Done   | Operational cockpit (analytics API + Recharts)                                  |
| **8**    | Quality sweep                      | Done   | Journey, a11y, consistency, CI e2e policy                                       |
| **8b**   | Staff convention parity (docs)     | Done   | CONVENTIONS depth + ANTI-PATTERNS; GOVERNANCE match `ci.yml`                    |
| **8c**   | Boundary + auth-code parity        | Done   | Invert lib -> features; drop English 403; ESLint `no-restricted-imports`        |
| **8a**   | Standalone Zero-Backend Preview    | Done   | MSW `dev:mock`, mock auth, hosted demo target                                   |
| **9**    | Query parity                       | Done   | Expose every list query param this API version already accepts                  |
| **10**   | Existing writes                    | Done   | Wire OpenAPI writes already shipped (users, products delete, roles UI)          |
| **11**   | API gaps then SPA                  | Done   | Product activate/deactivate + assign user role                                  |
| **11.5** | User address book                  | Done   | User detail address list + existing OpenAPI writes                              |
| **13**   | Technical release gate             | Done   | Production validation against API, clean install quickstart, smoke              |
| **13.5** | Visual Showcase & Portfolio Assets | Done   | Hero WebP, Retina screenshots, README embeds; refresh via `scripts/create-walkthrough.js` |

---

## Pending work

Live queue (not numeric order): finish **12.5**, then optional **12**, then **14** (blocked on API facts). Phase 12 does not block the already-done Phase 13 gate.

| Phase    | Name                               | Status | Priority | Focus                                                                           |
| -------- | ---------------------------------- | ------ | :------: | ------------------------------------------------------------------------------- |
| **12.5** | Operational UX & Real-Time Sync    | `[/]`  |  `[P1]`  | Core slice shipped (Theme, WS, safe landing); checklists/Cmd+K remaining        |
| **12**   | Payments ops                       | `[ ]`  |  `[P2]`  | Optional; does not block the release gate                                       |
| **14**   | Dashboard Operational Facts        | `[ ]`  |  `[P2]`  | Blocked on OpenAPI operational fields                                           |

---

## Phase 12.5: Operational UX, Aesthetics & Real-Time Interaction [P1]

> **Goal**: Transform the functional SPA into a responsive, polished operational cockpit with real-time feedback and guided workflows.

**OpenAPI capabilities:** WebSocket gateway notifications (`orders.created`, `inventory.low_stock`).

**Scope:**
- [x] **Working Theme Provider:** Replace the previously removed non-functional placeholder with an accessible Dark/Light/System theme provider linked to Tailwind CSS tokens and `localStorage` persistence.
- [x] **Real-Time WebSocket Feed:** Connect to API WebSocket gateway (`socket.io-client`). Show animated toast notifications when new orders arrive or stock drops below threshold, with query cache invalidation.
- [x] **Guided Operator Checklist (Empty States):** Replace generic empty tables with an interactive "First-Time Operator Setup Guide" (e.g., 1. Add first product, 2. Set warehouse stock, 3. Review store settings).
- [ ] **Command Palette (`Cmd+K` / `Ctrl+K`) [P2]:** Fast keyboard search and quick navigation across products, orders, customers, and setting views.
- [ ] **Visual Micro-Interactions & Trend Badges [P2]:** Add trend percentage pills (▲/▼ % vs previous period) on dashboard cards and animated skeleton loaders during query transitions.
- [x] **Silent refresh updates session Query:** After mid-request token refresh, update `AUTH_SESSION_QUERY_KEY` with permissions / `mustChangePassword` (not only `setAccessToken`), so nav chrome stays accurate if roles change mid-session.
- [x] **Safe landing for limited operators:** Post-login and Forbidden CTA must not trap accounts with `access_admin` but without `view_all_orders` on `/` (land on first permitted nav item; Forbidden "home" must not loop).
- [x] **Auth bootstrap retry:** Distinguish transient refresh/network failures from unauthenticated; avoid hard bounce to login with no retry on boot 5xx.
- [x] **UsersTable column memo:** Memoize column defs like products/orders/inventory tables (minor render polish).
- [x] **Address form DialogDescription:** Align `user-address-form` dialog a11y with other dialogs.
- [ ] **Chart tooltip theming:** Recharts tooltips use theme tokens so dark mode never shows a white box.
- [ ] **Load the declared font:** `index.css` names Inter but nothing loads it; self-host it (e.g. `@fontsource-variable/inter`) or switch the token to a deliberate system stack.
- [ ] **Favicon and app icon:** ship a favicon and apple-touch icon so browser tabs are not blank.
- [ ] **Product thumbnails:** show the existing `imageUrl` in the products table and order line items, with a styled placeholder when it is `null`.
- [ ] **Product form image preview:** live preview of the typed image URL with a clear invalid or unreachable state. File upload waits on the API (see Out of scope).
- [ ] **Truncated text:** names clipped in tables expose the full value (`title` or tooltip).

**Done when:** Theme toggle works smoothly without flash; simulated WebSocket event triggers live toast and updates dashboard query cache; empty tables show actionable onboarding steps; product rows show a thumbnail or placeholder; the tab has a favicon; chart tooltips are readable in both themes.
**Location:** `src/components/theme/`, `src/lib/ws/`, `src/components/ui/command-palette.tsx`, `src/features/dashboard/`, `src/features/products/`, `src/index.css`, `index.html`

---

## Phase 13.5: Visual Showcase & Portfolio Assets (complete)

> Portfolio media for README and docs. Regenerate with Playwright while `npm run dev:mock` is running on port **5174**:
>
> - `npm run assets:stills` → Retina PNG stills (`scripts/capture-showcase.js`)
> - `npm run assets:walkthrough` → animated hero WebP (`scripts/create-walkthrough.js`)
> - `npm run assets:capture` → both

**Location:** `docs/assets/`, `scripts/capture-showcase.js`, `scripts/create-walkthrough.js`, `README.md`

---

## Phase 12: Payments ops (optional)

> The API already lists and mutates payments. v1 only showed payment **on order detail**. This is money movement: ship only if you want it in Control Center. **Does not block Phase 13.**

**OpenAPI capabilities:** payment list/detail and capture/refund/verify if present (discover in OpenAPI).

**Scope:**

- [ ] Payments list with the existing query DTO (`status`, `orderId`, `userId`, email/name, sort)
- [ ] Link from order detail to payment row
- [ ] Capture / refund / verify only with `view_all_payments` / whatever OpenAPI requires; disable illegal statuses; still handle API rejection
- [ ] Do not invent refund amounts the DTO does not allow

**Done when:** ops can find a payment without opening the order first; mutating actions are covered by tests.

---

## Phase 14: Dashboard Operational Facts [P2]

> **Goal**: Display operational order age, payment mix, and inventory sell-through facts once live storefront and payment flows exist.

**Blocked on:** OpenAPI contracts exposing `payment_failed` on attention, order age (`oldestCreatedAt` / `oldestUpdatedAt`), payment counts (`failedPaymentCount` / `pendingPaymentCount`), and inventory fields (`unitsSold7d` / `reservedQuantity`).

**Scope:**
- [ ] **Attention Pulse**: Surface `payment_failed` orders with direct links to cancel/manage; display order age chips (`oldestCreatedAt` / `oldestUpdatedAt`).
- [ ] **Payment Mix**: Show period `failedPaymentCount` and `pendingPaymentCount` on the dashboard overview.
- [ ] **Inventory Sell-Through**: Display `unitsSold7d` and `reservedQuantity` on low-stock alert rows.

**Done when:** Dashboard cards and attention chips display these operational fields directly from the API without client-side guessing.

---

## Out of scope (this API version)

- BFF
- Domain logic in the SPA
- Customer checkout UI, carts, register, inventory reserve/release/check (storefront)
- Inventing filters or buttons for operations that are not in OpenAPI
- Global client store for server data (use TanStack Query)
- Categories admin until the API exposes category list/write operations
- Product image file upload until the API exposes a media upload operation in OpenAPI; keep the image URL field, no base64 or client-side storage workaround

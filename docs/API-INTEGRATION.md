# API Integration

How `ecommerce-admin-dashboard` consumes [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api).

## Single source of truth

| Concern | Source of truth |
| :------ | :-------------- |
| Paths, methods, DTOs, status codes | API **OpenAPI / Swagger** (local URL is in the API README / local setup) |
| Auth, RBAC, cookies, versioning | API docs + OpenAPI |
| Local seed users | API [`docs/development/SEEDING.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) |
| Local API boot | API [`docs/development/LOCAL-SETUP.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md) |
| Delivery sequence | [`ROADMAP.md`](ROADMAP.md) |

Do **not** keep an endpoint inventory here. Added, removed, or renamed API routes are reflected by regenerating the typed client from OpenAPI and updating call sites. This file is for **admin client** rules only.

## Base connection

| Item | Typical local value |
| :--- | :------------------ |
| API origin | `VITE_API_BASE_URL` (default intent `http://localhost:3000`; use the API `PORT` when remapped) |
| Versioned API | Confirm versioning scheme in OpenAPI |
| Health | Confirm health routes in OpenAPI |

## Typed client

1. Generate a client from the API OpenAPI document during initial scaffold.
2. Use it for domain calls.
3. Regenerate when the API contract changes; do not treat hand-edited generated types as long-term truth.
4. Ship a regenerate npm script.

## Security (frontend)

See also root [`SECURITY.md`](../SECURITY.md).

- Never put secrets in `VITE_*` env vars (they ship to the browser).
- Prefer httpOnly cookie sessions when the API supports them; avoid `localStorage` for long-lived tokens.
- Admin XSS is high impact; escape/sanitize strings rendered from API/user input.
- Nav RBAC is UX only.

## Auth and RBAC (admin)

- Use the API auth operations from OpenAPI (login / refresh / logout / change-password).
- Access token in memory; refresh via HttpOnly cookie (`credentials: 'include'` on `apiClient`).
- Login, refresh, and change-password responses include `mustChangePassword`. When `true`, route to `/change-password` before the app shell.
- **Operators only:** require permission `access_admin` from the auth response `permissions` array. Accounts without it call logout (clear cookie), clear the access token, and show a dedicated login error. See [ADR-0006](architecture/adr/ADR-0006-operators-only-admin-spa.md) and [ADR-0007](architecture/adr/ADR-0007-auth-response-permissions-for-chrome.md).
- Permissions for chrome come from auth token responses (live from DB) per ADR-0007. Filter/form enums lock to OpenAPI via `satisfies`. Order status action buttons are UX chrome (API still rejects illegal transitions). Nav filtering is UX only.
- On domain `401`, attempt a single-flight silent refresh and one request retry ([ADR-0005](architecture/adr/ADR-0005-silent-one-shot-access-token-refresh.md)); if refresh returns `401`, return to login. If refresh fails with 5xx, 429, or network error, **keep the session** and fail the request ([ADR-0008](architecture/adr/ADR-0008-keep-session-alive-for-refresh-token-lifetime.md)). Refresh the access token whenever it is missing or near JWT `exp` (session query timer, window focus, and `onRequest`). Do not persist access or refresh tokens in `localStorage`. On successful mid-request refresh, propagate fresh claims and permissions to `AUTH_SESSION_QUERY_KEY` so nav chrome stays accurate. On `403` with code `MUST_CHANGE_PASSWORD`, redirect to change-password. Other `403` responses show forbidden; do not invent a bypass.
- Seeded **administrator** / **customer** accounts: API seeding doc only (no passwords in this repo).

## Concurrency (`409`)

Product, inventory adjust, and order updates may use optimistic concurrency. On `409`:

1. Reload the entity from the API.
2. Let the operator retry.
3. Do not silently overwrite.

Confirm version/conflict fields in OpenAPI for each write operation you use.

## Error UX (client mapping only)

| Class | Typical admin behavior |
| :---- | :--------------------- |
| Validation | Form/field errors from payload |
| `401` | Refresh if access token missing/expired; silent refresh + one retry; login only when refresh is 401 |
| `403` | Forbidden; hide nav that requires the permission |
| `404` | Empty / not found |
| `409` | Reload and retry |
| `429` | Retryable banner; keep last good list data when a refresh is rate-limited |
| `5xx` | Retryable banner/toast |

### Client layering

| Layer | Use |
| :---- | :-- |
| `*-api.ts` | `throwApiErrorFromResponse` only - parse API bodies into `ApiRequestError` |
| Queries | `QueryStateAlert` + `getErrorMessage` |
| Dialogs / actions | `getErrorMessage` + `ActionErrorAlert` |
| Forms | `applyApiFormErrors` + field `matchField`; skip inline error on `409` via `isOptimisticLockConflict` (parent reloads entity) |

Helpers live in `src/lib/api/parse-api-error.ts`, `src/lib/api/form-api-errors.ts`, and `src/components/feedback/action-error-alert.tsx`.

## Capability areas (discover in OpenAPI)

Typical admin surfaces: authentication/session, products, inventory, orders, payments on an order, users and address book, roles, analytics widgets.

When OpenAPI documents a read that returns **200 + `null`**, treat that as empty (no stock row, no payment yet). Do not map it to an error banner.

Out of scope for this app: customer checkout UI, inventing business metrics in the SPA, anything the operator role is not meant to do.

Build order: [`ROADMAP.md`](ROADMAP.md).

## Dashboard metrics

Bind widgets to the **analytics** operations in OpenAPI (UTC periods). Do **not** sum paginated order rows in the SPA. Grafana/Prometheus is engineering observability only - not an admin data source.

Client rules:

- Period comes from the URL (`?days=7|30|90`, default 7). Period queries use TanStack Query `keepPreviousData`.
- Errors are **per widget** (retry in place). The shared QueryClient skips retries on HTTP `429`.
- SPA list caches use TanStack Query `staleTime` (~45s).

After API OpenAPI changes: regenerate `src/lib/api/generated/schema.d.ts` via `npm run api:generate` against a running API, or `npx openapi-typescript` against the API OpenAPI document from a sibling checkout.

## When the API changes

1. Run the updated API.
2. Regenerate the OpenAPI client.
3. Fix compile errors and call sites.
4. Update tests.
5. Edit this file only when an admin **client rule** changes (RBAC UX, 409 handling), not when a path string changes.

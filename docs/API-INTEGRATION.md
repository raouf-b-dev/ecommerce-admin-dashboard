# API Integration

How `ecommerce-admin-dashboard` consumes [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api).

## Single source of truth

| Concern | Source of truth |
| :------ | :-------------- |
| Paths, methods, DTOs, status codes | API **OpenAPI / Swagger** (`http://localhost:3000/api` locally) |
| Auth, RBAC, cookies, versioning | API docs + OpenAPI |
| Local seed users | API [`docs/development/SEEDING.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) |
| Local API boot | API [`docs/development/LOCAL-SETUP.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md) |
| Delivery sequence | [`ROADMAP.md`](ROADMAP.md) |

Do **not** keep an endpoint inventory here. Added, removed, or renamed API routes are reflected by regenerating the typed client from OpenAPI and updating call sites. This file is for **admin client** rules only.

## Base connection

| Item | Typical local value |
| :--- | :------------------ |
| API origin | `http://localhost:3000` (from `VITE_API_BASE_URL`) |
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

- Use the API auth operations from OpenAPI (login / refresh / logout as documented).
- Permissions and roles are API-owned. Nav filtering is UX only.
- Load permission claims from whatever the API returns on auth/profile (confirm in Swagger).
- On `401`, return to login. On `403`, show forbidden; do not invent a bypass.
- Seeded **administrator** account: API seeding doc only (no passwords in this repo).

## Concurrency (`409`)

Product/order updates may use optimistic concurrency. On `409`:

1. Reload the entity from the API.
2. Let the operator retry.
3. Do not silently overwrite.

Confirm version/conflict fields in OpenAPI for each write operation you use.

## Error UX (client mapping only)

| Class | Typical admin behavior |
| :---- | :--------------------- |
| Validation | Form/field errors from payload |
| `401` | Login |
| `403` | Forbidden; hide nav that requires the permission |
| `404` | Empty / not found |
| `409` | Reload and retry |
| `5xx` | Retryable banner/toast |

## Capability areas (discover in OpenAPI)

Concrete paths live in Swagger. Typical admin needs:

- Health for local diagnostics
- Admin login/session; permission/role reads if needed for chrome
- Product list/detail and product writes
- Inventory reads (and adjust/low-stock if you ship them)
- Order list/detail and allowed status transitions; payment reads optional
- Customer/user reads (writes optional)
- Dashboard inputs from existing reads or future API aggregates

Out of scope for this app: customer checkout UI, inventing business metrics in the SPA, anything the operator role is not meant to do.

Build order for these capabilities: [`ROADMAP.md`](ROADMAP.md).

## Dashboard metrics

Prefer API aggregates or documented read models. If you derive widgets from list endpoints, document that totals may be approximate under pagination, or wait for proper aggregate endpoints.

## When the API changes

1. Run the updated API.
2. Regenerate the OpenAPI client.
3. Fix compile errors and call sites.
4. Update tests.
5. Edit this file only when an admin **client rule** changes (RBAC UX, 409 handling), not when a path string changes.

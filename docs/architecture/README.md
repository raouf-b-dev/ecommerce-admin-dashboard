# Architecture Documentation

SPA architecture context, auth flows, and decision records for `ecommerce-admin-dashboard`.

---

## What belongs here

- **System architecture** — browser → Vite SPA → API context, provider tree, folder layout
- **ADRs (`adr/`)** — immutable records explaining _why_ cross-cutting frontend decisions were made

## What does not belong here

- API domain design (see [ecommerce-store-api architecture](https://github.com/raouf-b-dev/ecommerce-store-api/tree/master/docs/architecture))
- Endpoint inventories (OpenAPI / Swagger is the contract)
- Day-to-day coding patterns (see [`docs/ai/CONVENTIONS.md`](../ai/CONVENTIONS.md))

## Recommended reading order

1. [ARCHITECTURE.md](ARCHITECTURE.md) — system context, auth flow, source layout
2. [adr/README.md](adr/README.md) — ADR index
3. [ADR-0001](adr/ADR-0001-auth-first-routing-and-route-guards.md) — auth-first routing
4. [ADR-0002](adr/ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md) — session storage
5. [ADR-0003](adr/ADR-0003-client-rbac-chrome-api-authoritative.md) — RBAC chrome boundary

## Related docs

| Document | Role |
| :------- | :--- |
| [`docs/API-INTEGRATION.md`](../API-INTEGRATION.md) | Client integration rules |
| [`SECURITY.md`](../../SECURITY.md) | Frontend security baseline |
| [`docs/ai/CONVENTIONS.md`](../ai/CONVENTIONS.md) | Implementation patterns |

# Architecture Documentation

Notes on how the admin SPA is put together: routing, auth, and the decisions behind them.

## What belongs here

- **System architecture:** browser to Vite SPA to API, provider tree, folder layout
- **ADRs (`adr/`):** why we picked certain patterns (routing, session storage, RBAC in the UI)

## What does not belong here

- API domain design ([ecommerce-store-api architecture](https://github.com/raouf-b-dev/ecommerce-store-api/tree/master/docs/architecture))
- Endpoint lists (use OpenAPI / Swagger)
- Day-to-day coding patterns ([`docs/ai/CONVENTIONS.md`](../ai/CONVENTIONS.md))

## Reading order

1. [ARCHITECTURE.md](ARCHITECTURE.md) for the big picture
2. [adr/README.md](adr/README.md) for the ADR index
3. [ADR-0001](adr/ADR-0001-auth-first-routing-and-route-guards.md) (routing)
4. [ADR-0002](adr/ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md) (session)
5. [ADR-0007](adr/ADR-0007-auth-response-permissions-for-chrome.md) (RBAC chrome permissions; supersedes ADR-0003)
6. [ADR-0005](adr/ADR-0005-silent-one-shot-access-token-refresh.md) (silent refresh)
7. [ADR-0006](adr/ADR-0006-operators-only-admin-spa.md) (`access_admin` admission)
8. [ADR-0008](adr/ADR-0008-keep-session-alive-for-refresh-token-lifetime.md) (stay signed in for refresh-token TTL)

## Related

| Document | Role |
| :------- | :--- |
| [`docs/API-INTEGRATION.md`](../API-INTEGRATION.md) | Client integration rules |
| [`SECURITY.md`](../../SECURITY.md) | Frontend security baseline |
| [`docs/ai/CONVENTIONS.md`](../ai/CONVENTIONS.md) | Implementation patterns |

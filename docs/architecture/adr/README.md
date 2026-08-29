# Architecture Decision Records (ADRs)

---

Document Type: Reference & Index  
Audience: Frontend engineers & reviewers  
Status: Active

---

This directory records Architecture Decision Records for `ecommerce-admin-dashboard`.

## What is an ADR?

An ADR captures a single significant architectural decision: context, rationale, alternatives, and consequences. ADRs are **immutable**. If a decision changes, write a new ADR that supersedes the old one.

## Naming standard

`ADR-XXXX-[short-title].md` (four-digit zero-padded number).

## ADR index

| ADR | Status | Summary | Date |
| :-- | :----- | :------ | :--- |
| [ADR-0001](ADR-0001-auth-first-routing-and-route-guards.md) | Accepted | Auth-first routing; `/login` public; shell behind guards; `redirect` query param | 2026-08-28 |
| [ADR-0002](ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md) | Accepted | Access token in memory; refresh via HttpOnly cookie; no `localStorage` | 2026-08-28 |
| [ADR-0003](ADR-0003-client-rbac-chrome-api-authoritative.md) | Accepted | Nav filtering and route gates are UX only; API enforces authorization | 2026-08-28 |
| [ADR-0004](ADR-0004-forced-password-change-routing.md) | Accepted | Forced password change at `/change-password`; shell gated by `mustChangePassword` | 2026-08-29 |

Cross-link API ADRs when relevant; do not duplicate backend decision records here.

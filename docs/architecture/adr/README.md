# Architecture Decision Records (ADRs)

---

Document Type: Reference & Index  
Audience: Frontend engineers & reviewers  
Status: Active

---

This directory records Architecture Decision Records for `ecommerce-admin-dashboard`.

## What is an ADR?

An ADR captures a single significant architectural decision: context, rationale, alternatives, and consequences.

ADRs are **immutable historical documents**. They record _why_ a decision was made at a specific point in time.

**Do not rewrite or amend the body** of an existing ADR (sections such as Context, Decisions, Alternatives, Consequences).

### What may change later

| Allowed | Not allowed |
| :------ | :---------- |
| File header **Status** (`Proposed` → `Accepted` → `Deprecated` / `Superseded`) | Rewriting Decisions / Alternatives / Consequences |
| Optional header **Superseded By** / **Supersedes** links when lifecycle changes | Quietly amending the original decision in place |
| This **index** table (status, supersedes, superseded-by) | Deleting historical ADRs |

If a decision changes or is extended:

1. **Write a new ADR** (`ADR-XXXX-[short-title].md`).
2. Link the prior ADR from the new record (`Context` / `Does not supersede` / `Supersedes`: same style as API ADRs).
3. Update this **index**.
4. **Full replacement only:** set the old ADR header **Status** to `Superseded` and add **Superseded By: ADR-XXXX**. Leave the rest of the old file untouched.
5. **Extension only** (new ADR adds behavior; prior decisions still stand): leave the old ADR **Accepted**; new ADR uses **Does not supersede**.

## Lifecycle states

| Status | Meaning |
| :----- | :------ |
| `Proposed` | Written during design; awaiting approval |
| `Accepted` | Approved and in effect |
| `Deprecated` | No longer recommended |
| `Superseded` | Replaced by a later ADR (must link the successor) |

## Naming standard

`ADR-XXXX-[short-title].md` (four-digit zero-padded number).

## ADR index

| ADR | Status | Summary | Date | Supersedes | Superseded By |
| :-- | :----- | :------ | :--- | :--------- | :------------ |
| [ADR-0001](ADR-0001-auth-first-routing-and-route-guards.md) | Accepted | Auth-first routing; `/login` public; shell behind guards; `redirect` query param | 2026-08-28 | - | - |
| [ADR-0002](ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md) | Accepted | Access token in memory; refresh via HttpOnly cookie; no `localStorage` | 2026-08-28 | - | - |
| [ADR-0003](ADR-0003-client-rbac-chrome-api-authoritative.md) | Superseded | Nav filtering and route gates are UX only; API enforces authorization (UX role map) | 2026-08-28 | - | [ADR-0007](ADR-0007-auth-response-permissions-for-chrome.md) |
| [ADR-0004](ADR-0004-forced-password-change-routing.md) | Accepted | Forced password change at `/change-password`; shell gated by `mustChangePassword` | 2026-08-29 | - | - |
| [ADR-0005](ADR-0005-silent-one-shot-access-token-refresh.md) | Accepted | Silent one-shot refresh + single-flight on domain 401; extends ADR-0002 | 2026-08-29 | - | - |
| [ADR-0006](ADR-0006-operators-only-admin-spa.md) | Accepted | SPA admission via `access_admin`; login reject + `OperatorRoute` | 2026-08-29 | - | - |
| [ADR-0007](ADR-0007-auth-response-permissions-for-chrome.md) | Accepted | Session permissions from auth response; supersedes ADR-0003 UX role map | 2026-08-29 | [ADR-0003](ADR-0003-client-rbac-chrome-api-authoritative.md) | - |
| [ADR-0008](ADR-0008-keep-session-alive-for-refresh-token-lifetime.md) | Accepted | Refresh when access token missing/expired; only refresh 401 logs out; extends ADR-0002/0005 | 2026-09-07 | - | - |

Cross-link API ADRs when relevant; do not duplicate backend decision records here.

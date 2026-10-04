---
name: write-docs
description: Create or update documentation, ADRs, and roadmap entries. Use when adding or editing anything under docs/, writing an ADR, ticking a ROADMAP task, fixing doc links, or deciding where a doc belongs.
---

# Write docs

## Rules

- **ASCII only**: CONVENTIONS section 19; `npm run lint` checks it.
- **One rule, one place.** Link instead of copying. Roadmap phase numbers appear only in `docs/ROADMAP.md` (CONVENTIONS section 13).
- **No second endpoint inventory.** The OpenAPI contract is the source; `docs/API-INTEGRATION.md` holds client rules only.
- **Docs follow the code.** Verify every path, symbol, and command you write exists before you commit.

## Where things go

| Content                                         | File                                     |
| ----------------------------------------------- | ---------------------------------------- |
| Coding rules and patterns                       | `docs/ai/CONVENTIONS.md` (keep section numbers: ADRs cite them) |
| Bad and good examples, review checklist         | `docs/ai/ANTI-PATTERNS.md`               |
| Where modules and shared code live              | `docs/ai/CODE-MAP.md`                    |
| System shape, auth flow, provider tree          | `docs/architecture/ARCHITECTURE.md`      |
| Decisions                                       | `docs/architecture/adr/`                 |
| How the SPA talks to the API                    | `docs/API-INTEGRATION.md`                |
| Delivery plan and done criteria                 | `docs/ROADMAP.md`                        |
| Live-API release checklist                      | `docs/RELEASE-GATE.md`                   |
| Playwright setup                                | `e2e/README.md`                          |

New doc: use an uppercase kebab-case filename and add it to [docs/README.md](../../../docs/README.md).

## ADRs

Write `docs/architecture/adr/ADR-XXXX-[short-title].md` (next four-digit number) when a change affects:

- auth-first routing or guard behavior, including operator gates
- session or token storage
- mid-request auth recovery (silent refresh, retry policy)
- the client RBAC chrome boundary or how permissions are resolved
- a new global state pattern, for example replacing TanStack Query for server data

Immutable body, states, supersede rules, naming, and the index: [adr/README.md](../../../docs/architecture/adr/README.md). Update the index in the same change.

## When a feature ships

1. Tick the task in `docs/ROADMAP.md` (`rg` for the phase; do not read the whole file).
2. Update `docs/architecture/ARCHITECTURE.md` if routing, auth, or the provider tree changed.
3. Update `docs/ai/CODE-MAP.md` if a top-level folder or shared helper was added or removed.
4. Update `docs/RELEASE-GATE.md` or `e2e/README.md` if the operator smoke or e2e setup changed.

## Check

Links resolve, headings match the index, no deleted file is still linked (`rg '<old-name>' docs README.md CONTRIBUTING.md`), then `npm run lint`.

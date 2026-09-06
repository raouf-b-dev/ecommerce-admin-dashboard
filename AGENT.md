# Agent Governance and Development Policy

This is the canonical repository policy for AI-assisted development in `ecommerce-admin-dashboard`.

## 1. Order of Authority

When instructions conflict, resolve in this order:

1. Direct human task instruction for the active work.
2. This `AGENT.md` policy.
3. Canonical docs in `docs/`.
4. Tool-specific adapters (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*`).

## 2. Canonical References

- Project context: [`.agents/PROJECT-CONTEXT.md`](.agents/PROJECT-CONTEXT.md)
- UI conventions: [`docs/ai/CONVENTIONS.md`](docs/ai/CONVENTIONS.md)
- Quality gates: [`docs/ai/GOVERNANCE-AND-QUALITY-GATES.md`](docs/ai/GOVERNANCE-AND-QUALITY-GATES.md)
- Workflow: [`docs/ai/WORKFLOW-PLAYBOOK.md`](docs/ai/WORKFLOW-PLAYBOOK.md)
- Security baseline: [`SECURITY.md`](SECURITY.md)
- API integration rules: [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md)
- Architecture: [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)

## 3. Context First

Before starting feature work, read `.agents/PROJECT-CONTEXT.md` for the current stack, directory map, boundary rules, and API integration notes.

## 4. Non-Negotiables

1. No domain rules live in this SPA.
2. RBAC chrome is UX only. The API enforces authorization.
3. OpenAPI is the contract source of truth. The generated client is the default integration path.
4. Browser-exposed env is limited to `VITE_*` public values only.
5. Tests are written with each feature, not deferred to the end.
6. Require verification evidence for behavior changes.
7. Do not push changes without explicit confirmation and verification evidence.
8. If API contract or docs drift, fix them at the source in `ecommerce-store-api` rather than hiding the issue in frontend code.

## 5. Conventions Rule

All implementation and refactor work must apply [`docs/ai/CONVENTIONS.md`](docs/ai/CONVENTIONS.md).

At minimum, that includes:

- feature folder layout
- query key and mutation invalidation patterns
- form and API error mapping
- table query parameter mapping
- optimistic concurrency (`409`) handling

## 6. Execution Lifecycle

Use this sequence for work:

1. Intake
2. Plan
3. Execute
4. Verify
5. Handoff

Escalate when security, auth/session behavior, API contract meaning, or data integrity is unclear.

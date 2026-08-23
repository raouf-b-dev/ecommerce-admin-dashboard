# AI and agent docs

Agent policy and coding conventions for this repository. Sequencing lives in [`../ROADMAP.md`](../ROADMAP.md).

## Planned files

| File | Role |
| :--- | :--- |
| [../../AGENT.md](../../AGENT.md) | Canonical agent policy (repo root) |
| [../../.agents/PROJECT-CONTEXT.md](../../.agents/PROJECT-CONTEXT.md) | Compact project snapshot |
| [CONVENTIONS.md](CONVENTIONS.md) | SPA coding conventions |
| [GOVERNANCE-AND-QUALITY-GATES.md](GOVERNANCE-AND-QUALITY-GATES.md) | Merge / quality gates |
| [WORKFLOW-PLAYBOOK.md](WORKFLOW-PLAYBOOK.md) | How to execute a roadmap task |

Tool adapters (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*`) should point at `AGENT.md` and must not fork policy.

## Non-negotiables (preview)

- No domain rules in this SPA.
- RBAC chrome is UX only; the API enforces authorization.
- Prefer the OpenAPI client for domain calls.
- Write tests with features.
- Require verification for behavior changes.

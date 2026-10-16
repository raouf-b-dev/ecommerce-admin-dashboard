# AI Guidance

Agent instructions are deliberately small. [AGENTS.md](../../AGENTS.md) at the repository root is the single entry point. Claude Code reaches it through `CLAUDE.md` (`@AGENTS.md`), Gemini CLI through `.gemini/settings.json`; Cursor, Codex, Copilot, Windsurf, and Antigravity read `AGENTS.md` natively. It tells agents which file to load for which task.

| File                                     | Purpose                                              |
| ---------------------------------------- | ---------------------------------------------------- |
| [CONVENTIONS.md](CONVENTIONS.md)         | Layout, routing, auth, Query, error, and mock rules  |
| [ANTI-PATTERNS.md](ANTI-PATTERNS.md)     | Bad and good examples, review checklist              |
| [CODE-MAP.md](CODE-MAP.md)               | Where modules and shared code live                   |

Task procedures are skills in `.agents/skills/<name>/SKILL.md`: `write-tests`, `add-feature`, `write-docs`. Skills follow the open [Agent Skills](https://agentskills.io) layout: a folder with a `SKILL.md` whose frontmatter has `name` and a "use when" `description`; extra files under `references/` load on demand.

Human reference docs (architecture, ADRs, API integration, roadmap) are indexed in [docs/README.md](../README.md) and are not loaded by agents unless the task is in that area.

## CI and merge gates

`.github/workflows/ci.yml` runs `lint`, `typecheck`, `unit-tests`, `build`, and `audit` in parallel; branch protection requires the aggregate **CI Status Check** (`ci`), not the job names. Playwright runs on pull requests into `master` and on manual dispatch, needs a seeded live API and the `E2E_*` secrets, and fails when they are missing (no skip-to-green). Feature pull requests into `develop` skip it. Details: [e2e/README.md](../../e2e/README.md). Prettier is for local formatting only and is not a gate. Weekly Dependabot updates (npm and GitHub Actions) are configured in `.github/dependabot.yml`; GitHub Dependency Review is not a gate (it needs GitHub Advanced Security on a private repository).

## Maintaining this folder

- Keep `AGENTS.md` under about 60 lines. Move detail into a skill or a doc linked from its table.
- One rule lives in one place. Link instead of copying.
- Rules a tool can enforce belong in ESLint, not prose.
- Do not add per-tool adapter files (Cursor rules, Copilot instructions, `.windsurfrules`, `GEMINI.md`). Tools read `AGENTS.md`.

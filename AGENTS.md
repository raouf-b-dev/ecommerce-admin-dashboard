# ecommerce-admin-dashboard

Operator SPA for `ecommerce-store-api`. Vite, React 19, TypeScript (strict), React Router data router, TanStack Query and Table, React Hook Form + Zod, Tailwind + shadcn-style primitives, `openapi-fetch` client. Vitest + Testing Library, Playwright. Node 24+.

## Verify

`npm run verify` runs lint (ESLint + ASCII prose), typecheck, unit tests, and build. Run it before reporting a task done. One spec: `npx vitest run <path>`. Playwright (`npm run test:e2e`) needs a seeded live API: run it only when you change the critical path, keyboard, or a11y behavior.

In your final message give: what changed, the commands you ran with results, and open risks or assumptions.

## Never

1. Use `as` assertions (except `as const`), `any`, or `@ts-ignore`. Narrow with type guards, Zod, annotations, and `satisfies` (tests: `write-tests` skill). `eslint-suppressions.json` is a frozen baseline of older violations: never add entries. After fixing one run `npm run lint:prune`; `npm run lint:fix` exits 2 when it fixes a baselined violation, so run `lint:prune` then too. Avoid new `!` non-null assertions (not lint-enforced).
2. Write em or en dashes, curly quotes, or the ellipsis character in code, comments, or docs. Use ASCII (`-`, `'`, `"`, `...`); `docs/ai/CONVENTIONS.md` section 19.
3. Put domain rules in the SPA or work around a wrong API contract here: guards and disabled buttons are UX only, and the fix goes in `ecommerce-store-api` (CONVENTIONS section 1).
4. Call the API outside the generated client wrappers (`src/lib/api/client.ts`), or match English error messages: use API `code` values and `src/lib/api/parse-api-error.ts`.
5. Break the layout rules in CONVENTIONS section 2 and 7: `lib/` importing `features/` (ESLint enforces it), barrel `index.ts` files, API calls in pages or components, mutations that skip `lists()` and `detail(id)` invalidation.
6. Store tokens outside memory or put secrets in `VITE_*` variables. Browser env is public.
7. Import `@/lib/mock/*` outside the allowed touchpoints (CONVENTIONS section 15).
8. Ship a behavior change without co-located specs for success, error, and permission paths.
9. Run without explicit user approval: `git push`, `npm publish`, or anything that changes CI or production config. Never edit an accepted ADR body.

Stop and ask when auth or session behavior, API contract meaning, or data integrity is unclear.

## Load only when

Skills are folders `.agents/skills/<name>/SKILL.md`. Open the file when its row applies, even if your tool does not discover skills itself.

| When you are | Load |
| --- | --- |
| Writing or fixing tests, or removing `as`/`any` from a spec | `.agents/skills/write-tests/SKILL.md` |
| Adding a feature, page, hook, API wrapper, form, or table | `.agents/skills/add-feature/SKILL.md` |
| Writing docs, ADRs, or ROADMAP entries | `.agents/skills/write-docs/SKILL.md` |
| Needing layout, routing, auth, Query, error, or mock rules | `docs/ai/CONVENTIONS.md` |
| Reviewing against known bad patterns | `docs/ai/ANTI-PATTERNS.md` |
| Looking for where something lives | `docs/ai/CODE-MAP.md` |
| Calling or changing an API endpoint | `docs/API-INTEGRATION.md` |
| Touching tokens, cookies, env vars, or auth flows | `SECURITY.md`, `docs/architecture/ARCHITECTURE.md` |
| Running or changing Playwright | `e2e/README.md` |

Never load `docs/ROADMAP.md` in full; `rg` for the phase. Other `docs/` files are human reference: open one only when its area is the task.

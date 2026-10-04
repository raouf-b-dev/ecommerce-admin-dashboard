# Admin Anti-Patterns and Review Checklist

Bad and good examples that enforce [CONVENTIONS.md](CONVENTIONS.md). Used when writing and reviewing code.

## 1. Import direction

Rule: CONVENTIONS section 2 (`lib/` never imports `features/`).

Bad:

```ts
// src/lib/auth/auth-context.tsx
import { something } from '@/features/dashboard/lib/x';
```

Good: keep session and HTTP helpers in `lib/`. Inject feature side effects from the app shell (`main.tsx`, providers), or move the shared helper into `lib/`.

## 2. No English-message matching

Rule: CONVENTIONS section 1 (structured API `code` values).

Bad:

```ts
body.message?.includes('Password change required');
```

Good:

```ts
body.code === 'MUST_CHANGE_PASSWORD';
```

## 3. No domain rules in the SPA

Rule: CONVENTIONS section 1 (UX only; the API enforces).

Bad:

```ts
if (product.stock < qty) throw new Error('Insufficient stock');
```

Good:

```ts
// Call the API; map ApiRequestError into ActionErrorAlert or form fields
await reserveStock(payload);
```

## 4. No type assertions

Rule: AGENTS.md rule 1. Prove the type instead of claiming it. Fix baselined casts when you touch the file, then run `npm run lint:prune`.

| Instead of                                             | Write                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `(LIST as readonly string[]).includes(value)`          | `LIST.some((item) => item === value)` inside a `value is T` guard                       |
| `JSON.parse(text) as Record<string, unknown>`          | `z.record(z.string(), z.unknown()).parse(JSON.parse(text))` (or a `safeParse` branch)   |
| `(error as { statusCode: number }).statusCode`         | `'statusCode' in error && typeof error.statusCode === 'number'` (`in` narrows `object`) |
| `await response.json() as Body`                        | `BodySchema.parse(await response.json())`                                              |
| `e.target.value as ActiveFilter`                       | `parseActiveFilter(e.target.value)` returning `ActiveFilter` with a fallback           |
| `error: null as Error \| null` in a spec               | declare `const error: Error \| null = null` or type the factory return                  |
| `window as unknown as { dispatchMockNotification }`    | `declare global { interface Window { ... } }` in a `.d.ts`, then use `window` directly |

## 5. Testing

Rule: `write-tests` skill (hook-mocked specs render without `QueryClientProvider`; no conditional `expect`).

Bad:

```tsx
render(
  <QueryClientProvider client={client}>
    <ProductsPage />
  </QueryClientProvider>,
);
```

Good: see the golden specs in `.agents/skills/write-tests/references/golden-specs.md`.

## 6. ASCII prose

Rule: docs and comments look typed, not generated. Details: [CONVENTIONS.md](CONVENTIONS.md) section 19. Enforced by `npm run lint`.

## Review checklist

- [ ] No `lib/` -> `features/` imports
- [ ] Auth uses `MUST_CHANGE_PASSWORD` and other codes, not English substrings
- [ ] OpenAPI client only; no invented BFF; no new endpoint inventory
- [ ] No `as`, `any`, or `@ts-ignore`; no new `eslint-suppressions.json` entries
- [ ] Typed factories in specs; hook-mocked specs without `QueryClient`; no conditional `expect`
- [ ] Mutations invalidate `lists()` and `detail(id)`
- [ ] Roadmap phase IDs only in `docs/ROADMAP.md`
- [ ] ASCII punctuation in docs and comments

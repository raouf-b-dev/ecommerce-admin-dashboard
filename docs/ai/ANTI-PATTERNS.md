# Admin Anti-Patterns & Review Checklist

Document Type: Applied Guide & Review Checklist  
Audience: Frontend Engineers & AI Code Reviewers  
Status: Active

Concrete **Good ✅ vs. Bad ❌** examples that enforce [`CONVENTIONS.md`](./CONVENTIONS.md).

---

## 1. Import direction

### Rule: `src/lib/` must not import `src/features/`.

#### ❌ BAD

```ts
// src/lib/auth/auth-context.tsx
import { something } from '@/features/dashboard/lib/x';
```

#### ✅ GOOD

Keep session and HTTP helpers in `lib/`. Inject feature side-effects from the app shell (`main.tsx` / providers), or move shared helpers into `lib/`.

---

## 2. No English-message auth matching

### Rule: Prefer structured API `code` values. Patch the API if the contract is wrong.

#### ❌ BAD

```ts
body.message?.includes('Password change required');
```

#### ✅ GOOD

```ts
body.code === 'MUST_CHANGE_PASSWORD';
```

---

## 3. No domain rules in the SPA

### Rule: Hide/disable chrome for UX only. The API enforces authorization and stock/pricing.

#### ❌ BAD

```ts
if (product.stock < qty) throw new Error('Insufficient stock');
```

#### ✅ GOOD

```ts
// Call the API; map ApiRequestError into ActionErrorAlert / form fields
await reserveStock(payload);
```

---

## 4. Testing anti-patterns

### Rule: Hook-mocked page/component specs do not need `QueryClientProvider`.

#### ❌ BAD

```tsx
render(
  <QueryClientProvider client={client}>
    <ProductsPage />
  </QueryClientProvider>,
);
```

#### ✅ GOOD

```tsx
vi.spyOn(hooks, 'useProductsList').mockReturnValue(emptyListResult);
render(<ProductsPage />);
```

---

## Review checklist

- [ ] No `lib/` → `features/` imports (enable ESLint in phase 8c after invert)
- [ ] Auth uses `MUST_CHANGE_PASSWORD` code, not English substrings
- [ ] OpenAPI client only; no invented BFF
- [ ] Typed factories; hook-mocked specs without QueryClient
- [ ] Roadmap phase IDs only in `docs/ROADMAP.md`
- [ ] Docs and comments use ASCII punctuation (no em dashes or curly quotes)

## 8. ASCII prose

### Rule: Docs and comments look typed, not generated. No smart punctuation.

#### BAD

Em dash (U+2014) between clauses. Curly quotes. Ellipsis character (U+2026) in comments.

#### GOOD

```md
Phase 12.5: remaining polish
400-499 client errors
```

Enforced by ESLint `ascii-prose/no-smart-punctuation` on comments and `node scripts/lint-ascii-prose.cjs` on Markdown.

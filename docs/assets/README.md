# Admin visual assets (Phase 13.5)

Portfolio media for the README hero and screenshot gallery. Captured against **`npm run dev:mock`** (MSW; no API required).

## Prerequisites

1. From repo root: `npm run dev:mock` (port **5174**).
2. Playwright Chromium installed: `npx playwright install chromium` (once).

## Regenerate

```bash
# Terminal 1
npm run dev:mock

# Terminal 2
npm run assets:capture
```

Or run individually:

- `npm run assets:stills` → `docs/assets/screenshot-*.png`
- `npm run assets:walkthrough` → `docs/assets/dashboard-walkthrough.webp`

Override base URL if needed: `BASE_URL=http://localhost:5174 npm run assets:capture`

## Outputs referenced by README

| File | Purpose |
| :--- | :------ |
| `dashboard-walkthrough.webp` | Hero animated walkthrough |
| `screenshot-dashboard-{dark,light}.png` | Dashboard stills |
| `screenshot-inventory-detail-{dark,light}.png` | Inventory detail |
| `screenshot-rbac-matrix-{dark,light}.png` | Roles / permissions dialog |

Additional stills (products, categories, order detail, etc.) are written by `capture-showcase.js` for future docs use.

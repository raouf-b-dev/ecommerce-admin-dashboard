import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const adminRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const apiRoot = path.resolve(adminRoot, '../ecommerce-store-api');

function assertChromiumInstalled(): void {
  console.log('[e2e] Checking Playwright Chromium...');
  const executablePath = chromium.executablePath();
  if (existsSync(executablePath)) {
    console.log('[e2e] Chromium ready.');
    return;
  }

  throw new Error(
    `Playwright Chromium is not installed (expected ${executablePath}). Run: npm run playwright:install`,
  );
}

export default async function globalSetup(): Promise<void> {
  assertChromiumInstalled();

  if (process.env.E2E_SKIP_DB_SEED === '1') {
    console.log('[e2e] Skipping auth seed (E2E_SKIP_DB_SEED=1).');
    return;
  }

  console.log('[e2e] Seeding auth (npm run db:seed:auth)...');
  execSync('npm run db:seed:auth', {
    cwd: apiRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });
  console.log('[e2e] Auth seed done.');
}

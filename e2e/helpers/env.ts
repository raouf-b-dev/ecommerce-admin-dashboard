import { test } from '@playwright/test';

/** Fail CI when required secrets are missing; skip locally so `npm run test:e2e` still runs guest specs. */
export function skipUnlessEnv(...names: string[]): void {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length === 0) {
    return;
  }
  const list = missing.join(', ');
  if (process.env.CI) {
    throw new Error(`CI e2e requires ${list} (see e2e/README.md).`);
  }
  test.skip(true, `Set ${list} (see e2e/README.md).`);
}

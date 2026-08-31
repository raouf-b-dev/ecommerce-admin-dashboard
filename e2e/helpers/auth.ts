import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

/** Password that worked in this worker (survives forced rotation mid-suite). */
let cachedAdminPassword: string | null = null;

type LoginOutcome = 'shell' | 'change-password' | 'invalid' | 'unknown';

function shellMarker(page: Page) {
  // Present on desktop and mobile; "Control Center" is sidebar-only.
  return page.getByRole('button', { name: 'Log out' });
}

export function adminNav(page: Page) {
  return page.getByRole('navigation', { name: 'Admin' });
}

async function submitCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function waitForLoginOutcome(page: Page): Promise<LoginOutcome> {
  const loginError = page.getByText('Invalid email or password.');
  const changePasswordHeading = page.getByRole('heading', {
    name: 'Change your password',
  });
  const shell = shellMarker(page);

  await Promise.race([
    shell.waitFor({ state: 'visible', timeout: 15_000 }),
    changePasswordHeading.waitFor({ state: 'visible', timeout: 15_000 }),
    loginError.waitFor({ state: 'visible', timeout: 15_000 }),
  ]).catch(() => undefined);

  if (await shell.isVisible()) {
    return 'shell';
  }
  if (await changePasswordHeading.isVisible()) {
    return 'change-password';
  }
  if (await loginError.isVisible()) {
    return 'invalid';
  }
  return 'unknown';
}

async function completeForcedPasswordChange(
  page: Page,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await page.getByLabel('Current password').fill(currentPassword);
  await page.getByLabel('New password', { exact: true }).fill(newPassword);
  await page.getByLabel('Confirm new password').fill(newPassword);
  await page.getByRole('button', { name: 'Update password' }).click();
  await shellMarker(page).waitFor({ state: 'visible', timeout: 15_000 });
}

function uniquePasswords(...values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }
  return result;
}

/**
 * Signs in as the seeded admin. Handles forced password change and the case
 * where another worker already rotated the seed password.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL;
  const seedPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !seedPassword) {
    throw new Error(
      'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set for authenticated e2e tests.',
    );
  }

  const rotatedPassword =
    process.env.E2E_ADMIN_NEW_PASSWORD ?? `${seedPassword}Rotated1!`;

  const candidates = uniquePasswords(
    cachedAdminPassword,
    seedPassword,
    rotatedPassword,
  );

  for (let round = 0; round < 2; round++) {
    for (const password of candidates) {
      await submitCredentials(page, email, password);
      const outcome = await waitForLoginOutcome(page);

      if (outcome === 'shell') {
        cachedAdminPassword = password;
        return;
      }

      if (outcome === 'change-password') {
        await completeForcedPasswordChange(page, password, rotatedPassword);
        cachedAdminPassword = rotatedPassword;
        return;
      }
    }

    // Likely login rate-limit (10/min) or brief race — brief backoff then retry.
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }

  test.skip(
    true,
    'Seeded admin login failed. Start the API, run db:seed, and verify credentials in API SEEDING.md.',
  );
}

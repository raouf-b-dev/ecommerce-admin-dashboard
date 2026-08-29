import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set for authenticated e2e tests.',
    );
  }

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const loginError = page.getByText('Invalid email or password.');
  const changePasswordHeading = page.getByRole('heading', {
    name: 'Change your password',
  });
  const shell = page.getByText('Control Center');

  await Promise.race([
    shell.waitFor({ state: 'visible', timeout: 15_000 }),
    changePasswordHeading.waitFor({ state: 'visible', timeout: 15_000 }),
    loginError.waitFor({ state: 'visible', timeout: 15_000 }),
  ]);

  if (await loginError.isVisible()) {
    test.skip(
      true,
      'Seeded admin login failed. Start the API, run db:seed, and verify credentials in API SEEDING.md.',
    );
  }

  if (await changePasswordHeading.isVisible()) {
    const newPassword =
      process.env.E2E_ADMIN_NEW_PASSWORD ?? `${password}Rotated1!`;

    await page.getByLabel('Current password').fill(password);
    await page.getByLabel('New password', { exact: true }).fill(newPassword);
    await page.getByLabel('Confirm new password').fill(newPassword);
    await page.getByRole('button', { name: 'Update password' }).click();

    await shell.waitFor({ state: 'visible', timeout: 15_000 });
    return;
  }

  await shell.waitFor({ state: 'visible', timeout: 15_000 });
}

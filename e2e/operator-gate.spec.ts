import { test, expect } from '@playwright/test';
import { skipUnlessEnv } from './helpers/env';

test('customer login is blocked from Control Center', async ({ page }) => {
  skipUnlessEnv('E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD');

  const email = process.env.E2E_CUSTOMER_EMAIL!;
  const password = process.env.E2E_CUSTOMER_PASSWORD!;

  test.setTimeout(180_000);

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const operatorDenied = page.getByText(
    'This account cannot access the admin dashboard.',
  );
  const throttled = page.getByText('Too many sign-in attempts');

  await expect(operatorDenied.or(throttled)).toBeVisible({ timeout: 15_000 });

  if (await throttled.isVisible()) {
    await page.waitForTimeout(61_000);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  await expect(operatorDenied).toBeVisible();
  await expect(page.getByText('Control Center')).not.toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

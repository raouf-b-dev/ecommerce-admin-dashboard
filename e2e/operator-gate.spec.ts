import { test, expect } from '@playwright/test';

test('customer login is blocked from Control Center', async ({ page }) => {
  const email = process.env.E2E_CUSTOMER_EMAIL;
  const password = process.env.E2E_CUSTOMER_PASSWORD;

  test.skip(
    !email || !password,
    'Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD (see e2e/README.md).',
  );

  test.setTimeout(180_000);

  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const operatorDenied = page.getByText(
    'This account cannot access the admin dashboard.',
  );
  const throttled = page.getByText('Too many sign-in attempts');

  await Promise.race([
    operatorDenied.waitFor({ state: 'visible', timeout: 15_000 }),
    throttled.waitFor({ state: 'visible', timeout: 15_000 }),
  ]).catch(() => undefined);

  if (await throttled.isVisible()) {
    await page.waitForTimeout(61_000);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  await expect(operatorDenied).toBeVisible();
  await expect(page.getByText('Control Center')).not.toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

import { test, expect } from '@playwright/test';

/**
 * Uses superadmin@store.local so smoke tests can keep using admin@store.local
 * via loginAsAdmin without a rotated password.
 */
test.describe('Forced password change', () => {
  test('seeded super admin completes rotation and reaches dashboard', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const email =
      process.env.E2E_SUPERADMIN_EMAIL ?? 'superadmin@store.local';
    const password = process.env.E2E_SUPERADMIN_PASSWORD;
    const newPassword =
      process.env.E2E_SUPERADMIN_NEW_PASSWORD ??
      (password ? `${password}Rotated1!` : undefined);

    test.skip(
      !password || !newPassword,
      'Set E2E_SUPERADMIN_PASSWORD (and optionally E2E_SUPERADMIN_NEW_PASSWORD). See e2e/README.md.',
    );

    const loginError = page.getByText('Invalid email or password.');
    const changePasswordHeading = page.getByRole('heading', {
      name: 'Change your password',
    });
    const shell = page.getByRole('button', { name: 'Log out' });

    async function tryPassword(pwd: string): Promise<'change' | 'shell' | 'invalid'> {
      await page.goto('/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(pwd);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await Promise.race([
        changePasswordHeading.waitFor({ state: 'visible', timeout: 15_000 }),
        shell.waitFor({ state: 'visible', timeout: 15_000 }),
        loginError.waitFor({ state: 'visible', timeout: 15_000 }),
      ]).catch(() => undefined);

      if (await changePasswordHeading.isVisible()) {
        return 'change';
      }
      if (await shell.isVisible()) {
        return 'shell';
      }
      return 'invalid';
    }

    let outcome: 'change' | 'shell' | 'invalid' = 'invalid';
    for (let round = 0; round < 4; round++) {
      outcome = await tryPassword(password!);
      if (outcome === 'change') {
        break;
      }
      if (outcome === 'shell') {
        // Already past forced change (prior run); still assert shell access.
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        return;
      }
      // Seed password rejected — try rotated, then back off (login throttle).
      outcome = await tryPassword(newPassword!);
      if (outcome === 'change') {
        break;
      }
      if (outcome === 'shell') {
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }

    expect(outcome).toBe('change');

    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

    await page.getByLabel('Current password').fill(password!);
    await page.getByLabel('New password', { exact: true }).fill(newPassword!);
    await page.getByLabel('Confirm new password').fill(newPassword!);
    await page.getByRole('button', { name: 'Update password' }).click();

    await expect(shell).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

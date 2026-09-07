import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from './helpers/auth';

/**
 * Isolated from the admin worker page. Reloading that shared page would rotate
 * the admin refresh cookie and break later catalog specs.
 *
 * Covers the real HttpOnly cookie path: in-memory access token is dropped on
 * reload; the SPA must mint a new Bearer from POST /v1/authentication/refresh.
 * Expired-token cases are unit/integration tested with JWTs (no API TTL change).
 */
test.describe('Session cookie restore', () => {
  test('reload stays signed in while the refresh cookie is valid', async ({
    page,
  }) => {
    await loginAsSuperAdmin(page);

    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
      timeout: 15_000,
    });

    const refreshPosts: string[] = [];
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        request.url().includes('/v1/authentication/refresh')
      ) {
        refreshPosts.push(request.url());
      }
    });

    await page.reload();

    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
      timeout: 15_000,
    });
    expect(
      refreshPosts.length,
      'Reload should bootstrap via POST /v1/authentication/refresh',
    ).toBeGreaterThan(0);
  });

  test('clearing the refresh cookie sends the operator to login', async ({
    page,
  }) => {
    await loginAsSuperAdmin(page);
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

    await page.context().clearCookies();
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Log out' })).toHaveCount(0);
  });
});

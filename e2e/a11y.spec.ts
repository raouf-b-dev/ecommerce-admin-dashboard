// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { test, expect } from '@playwright/test';
import { expectNoSeriousAxeViolations } from './helpers/axe';

test('login page has no serious axe violations', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

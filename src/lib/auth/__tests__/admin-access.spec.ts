// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from 'vitest';
import { ACCESS_ADMIN_PERMISSION } from '@/lib/auth/admin-access';
import { hasPermission } from '@/lib/auth/permissions';

describe('ACCESS_ADMIN_PERMISSION', () => {
  it('gates admin chrome when present in session permissions', () => {
    expect(
      hasPermission(['access_admin', 'view_all_users'], ACCESS_ADMIN_PERMISSION),
    ).toBe(true);
  });

  it('blocks admin chrome when missing from session permissions', () => {
    expect(
      hasPermission(['view_own_orders'], ACCESS_ADMIN_PERMISSION),
    ).toBe(false);
    expect(hasPermission([], ACCESS_ADMIN_PERMISSION)).toBe(false);
  });
});

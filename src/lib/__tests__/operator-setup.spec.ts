// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from 'vitest';
import { buildOperatorSetupSteps } from '@/lib/operator-setup';

const adminPermissions = [
  'access_admin',
  'manage_products',
  'manage_inventory',
  'manage_roles',
];

describe('buildOperatorSetupSteps', () => {
  it('locks inventory when no products exist', () => {
    const steps = buildOperatorSetupSteps(adminPermissions, 0);
    expect(steps[1]?.status).toBe('locked');
    expect(steps[1]?.statusLabel).toContain('at least one product');
  });

  it('enables inventory when products exist', () => {
    const steps = buildOperatorSetupSteps(adminPermissions, 2);
    expect(steps[1]?.status).toBe('ready');
    expect(steps[1]?.href).toBe('/inventory');
  });

  it('marks steps forbidden when permissions are missing', () => {
    const steps = buildOperatorSetupSteps(['access_admin'], 1);
    expect(steps[0]?.status).toBe('forbidden');
    expect(steps[2]?.status).toBe('forbidden');
  });
});

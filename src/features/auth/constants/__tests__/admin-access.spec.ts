import { describe, expect, it } from 'vitest';
import { ACCESS_ADMIN_PERMISSION } from '@/features/auth/constants/admin-access';
import { resolvePermissionsForRole } from '@/features/auth/constants/system-role-permissions';
import { hasPermission } from '@/lib/auth/permissions';

describe('ACCESS_ADMIN_PERMISSION', () => {
  it('is assigned to SUPER_ADMIN and ADMIN in the UX role map', () => {
    expect(
      hasPermission(
        resolvePermissionsForRole('SUPER_ADMIN'),
        ACCESS_ADMIN_PERMISSION,
      ),
    ).toBe(true);
    expect(
      hasPermission(
        resolvePermissionsForRole('ADMIN'),
        ACCESS_ADMIN_PERMISSION,
      ),
    ).toBe(true);
  });

  it('is not assigned to CUSTOMER or unknown roles', () => {
    expect(
      hasPermission(
        resolvePermissionsForRole('CUSTOMER'),
        ACCESS_ADMIN_PERMISSION,
      ),
    ).toBe(false);
    expect(
      hasPermission(
        resolvePermissionsForRole('UNKNOWN'),
        ACCESS_ADMIN_PERMISSION,
      ),
    ).toBe(false);
  });
});

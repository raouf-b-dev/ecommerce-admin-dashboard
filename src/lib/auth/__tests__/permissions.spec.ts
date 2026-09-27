import { filterNavigation, hasPermission } from '@/lib/auth/permissions';
import { navigation } from '@/app/navigation';

describe('permissions helpers', () => {
  const adminPermissions = [
    'view_all_products',
    'view_all_orders',
    'manage_products',
  ];

  it('hasPermission returns true when permission is omitted', () => {
    expect(hasPermission(adminPermissions)).toBe(true);
  });

  it('hasPermission returns true when claim exists', () => {
    expect(hasPermission(adminPermissions, 'view_all_products')).toBe(true);
  });

  it('hasPermission returns false when claim is missing', () => {
    expect(hasPermission(adminPermissions, 'manage_roles')).toBe(false);
  });

  it('filterNavigation hides items without required permission', () => {
    const filtered = filterNavigation(navigation, adminPermissions);

    expect(filtered.map((item) => item.label)).toEqual([
      'Dashboard',
      'Products',
      'Orders',
    ]);
  });
});

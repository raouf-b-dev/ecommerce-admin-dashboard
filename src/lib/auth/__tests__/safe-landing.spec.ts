import { getDefaultLandingRoute } from '@/lib/auth/safe-landing';

describe('getDefaultLandingRoute', () => {
  it('returns "/" when user has view_all_orders permission', () => {
    expect(getDefaultLandingRoute(['access_admin', 'view_all_orders'])).toBe('/');
  });

  it('returns "/products" when user only has product permissions', () => {
    expect(
      getDefaultLandingRoute([
        'access_admin',
        'view_all_products',
        'manage_products',
      ]),
    ).toBe('/products');
  });

  it('returns "/inventory" when user only has inventory permissions', () => {
    expect(
      getDefaultLandingRoute(['access_admin', 'view_all_inventory']),
    ).toBe('/inventory');
  });

  it('returns "/users" when user only has user read permissions', () => {
    expect(
      getDefaultLandingRoute(['access_admin', 'view_all_users']),
    ).toBe('/users');
  });

  it('returns "/settings/roles" when user only has role management permission', () => {
    expect(
      getDefaultLandingRoute(['access_admin', 'manage_roles']),
    ).toBe('/settings/roles');
  });

  it('returns "/login" when user has no matching nav permissions', () => {
    expect(getDefaultLandingRoute(['access_admin'])).toBe('/login');
    expect(getDefaultLandingRoute([])).toBe('/login');
  });
});

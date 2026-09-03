import { navigateAfterLoginPath } from '@/features/auth/lib/navigate-after-login';
import type { AuthSession } from '@/features/auth/types';

describe('navigateAfterLoginPath', () => {
  const baseSession: AuthSession = {
    userId: '1',
    email: 'operator@store.local',
    role: 'ADMIN',
    permissions: ['access_admin', 'view_all_orders'],
    mustChangePassword: false,
  };

  it('routes to /change-password when mustChangePassword is true', () => {
    const session: AuthSession = {
      ...baseSession,
      mustChangePassword: true,
    };
    expect(navigateAfterLoginPath(session, '/products')).toBe('/change-password');
    expect(navigateAfterLoginPath(session, null)).toBe('/change-password');
  });

  it('preserves valid redirect paths', () => {
    expect(navigateAfterLoginPath(baseSession, '/products/new')).toBe(
      '/products/new',
    );
    expect(navigateAfterLoginPath(baseSession, '/inventory/12')).toBe(
      '/inventory/12',
    );
  });

  it('routes to "/" when redirect is null or "/" and operator can view orders', () => {
    expect(navigateAfterLoginPath(baseSession, null)).toBe('/');
    expect(navigateAfterLoginPath(baseSession, '/')).toBe('/');
  });

  it('routes to first permitted route when operator lacks view_all_orders and redirect is "/" or null', () => {
    const catalogSession: AuthSession = {
      ...baseSession,
      role: 'CATALOG_MANAGER',
      permissions: ['access_admin', 'view_all_products', 'manage_products'],
    };

    expect(navigateAfterLoginPath(catalogSession, null)).toBe('/products');
    expect(navigateAfterLoginPath(catalogSession, '/')).toBe('/products');
  });

  it('routes unsafe redirect queries (e.g. /login or protocol-relative) to safe landing route', () => {
    const catalogSession: AuthSession = {
      ...baseSession,
      role: 'CATALOG_MANAGER',
      permissions: ['access_admin', 'view_all_products', 'manage_products'],
    };

    expect(navigateAfterLoginPath(catalogSession, '/login')).toBe('/products');
    expect(navigateAfterLoginPath(catalogSession, '//evil.com')).toBe('/products');
  });
});

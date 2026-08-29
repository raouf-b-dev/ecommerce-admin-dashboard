/**
 * UX-only permission map for known system roles.
 * Mirrors API `SYSTEM_ROLES` — API remains authoritative for authorization.
 */
const ALL_ADMIN_PERMISSIONS = [
  'manage_products',
  'view_all_products',
  'manage_orders',
  'view_all_orders',
  'view_own_profile',
  'manage_own_addresses',
  'manage_inventory',
  'view_all_inventory',
  'manage_payments',
  'view_all_payments',
  'manage_users',
  'view_all_users',
  'manage_roles',
  'manage_carts',
  'view_own_orders',
  'view_own_payments',
  'manage_own_cart',
] as const;

const SYSTEM_ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  SUPER_ADMIN: ALL_ADMIN_PERMISSIONS,
  ADMIN: ALL_ADMIN_PERMISSIONS.filter((code) => code !== 'manage_roles'),
  CUSTOMER: [
    'view_own_orders',
    'view_own_payments',
    'manage_own_cart',
    'view_own_profile',
    'manage_own_addresses',
  ],
};

export function resolvePermissionsForRole(roleCode: string): string[] {
  const permissions = SYSTEM_ROLE_PERMISSIONS[roleCode];
  return permissions ? [...permissions] : [];
}

export const DEMO_ADMIN_EMAIL = 'admin@store.local';
export const DEMO_ADMIN_PASSWORD = 'demo';
export const DEMO_ADMIN_USER_ID = '1';
export const DEMO_ADMIN_ROLE = 'ADMIN';

export const DEMO_OPERATOR_PERMISSIONS = [
  'access_admin',
  'view_all_orders',
  'view_all_products',
  'view_all_inventory',
  'view_all_users',
  'view_all_payments',
  'manage_products',
  'manage_users',
  'manage_roles',
] as const;

export const DEMO_CATALOG_OPERATOR_EMAIL = 'catalog@store.local';
export const DEMO_CATALOG_OPERATOR_PASSWORD = 'demo';
export const DEMO_CATALOG_OPERATOR_USER_ID = '2';
export const DEMO_CATALOG_OPERATOR_ROLE = 'CATALOG_MANAGER';

export const DEMO_CATALOG_OPERATOR_PERMISSIONS = [
  'access_admin',
  'view_all_products',
  'manage_products',
] as const;

import type { NavItem } from '@/app/navigation';

export function hasPermission(
  permissions: readonly string[],
  permission?: string,
): boolean {
  if (!permission) {
    return true;
  }

  return permissions.includes(permission);
}

export function filterNavigation(
  items: NavItem[],
  permissions: readonly string[],
): NavItem[] {
  return items.filter((item) => hasPermission(permissions, item.permission));
}

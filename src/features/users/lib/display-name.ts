import { formatOptionalText } from '@/lib/format';

export function userDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const name = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return formatOptionalText(name);
}

export function formatUserRole(
  roleCode: string | null | undefined,
  roleName?: string | null,
): string {
  if (roleName?.trim()) {
    return roleName.trim();
  }
  if (!roleCode) {
    return '-';
  }
  return roleCode.replaceAll('_', ' ');
}

export function userDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const name = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return name || '—';
}

export function formatUserPhone(phone: string | null | undefined): string {
  if (typeof phone === 'string' && phone.trim()) {
    return phone;
  }
  return '—';
}

export function formatUserRole(roleCode: string | null | undefined): string {
  if (!roleCode) {
    return '—';
  }
  return roleCode.replaceAll('_', ' ');
}

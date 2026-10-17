import { describe, expect, it } from 'vitest';
import {
  formatUserRole,
  userDisplayName,
} from '@/features/users/lib/display-name';

describe('userDisplayName', () => {
  it('joins first and last name', () => {
    expect(userDisplayName({ firstName: 'Jane', lastName: 'Doe' })).toBe(
      'Jane Doe',
    );
  });

  it('falls back when names are empty', () => {
    expect(userDisplayName({ firstName: '', lastName: '  ' })).toBe('-');
    expect(userDisplayName({})).toBe('-');
  });
});

describe('formatUserRole', () => {
  it('prefers role name when provided', () => {
    expect(formatUserRole('SUPER_ADMIN', 'Super Admin')).toBe('Super Admin');
  });

  it('formats role codes when name is missing', () => {
    expect(formatUserRole('SUPER_ADMIN')).toBe('SUPER ADMIN');
    expect(formatUserRole(null)).toBe('-');
  });
});

import { describe, expect, it } from 'vitest';
import { updateUserSchema } from '@/features/users/schemas/user-schema';

const base = { firstName: 'Store', lastName: 'Admin', phone: '' };

describe('updateUserSchema', () => {
  it('accepts demo emails', () => {
    const result = updateUserSchema.safeParse({
      ...base,
      email: 'admin@store.local',
    });

    expect(result.success).toBe(true);
  });

  it('trims the email before validating it', () => {
    const result = updateUserSchema.safeParse({
      ...base,
      email: '  admin@store.local  ',
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('admin@store.local');
  });

  it('rejects invalid email format', () => {
    const result = updateUserSchema.safeParse({
      ...base,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a valid email');
  });
});

import { loginSchema } from '@/features/auth/schemas/login-schema';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@store.local',
      password: 'Admin123!',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty email with the required message first', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'Admin123!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Email is required');
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Admin123!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@store.local',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});

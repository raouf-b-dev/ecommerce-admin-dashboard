import { changePasswordSchema } from '@/features/auth/schemas/change-password-schema';

describe('changePasswordSchema', () => {
  it('accepts matching new passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass2!',
      confirmPassword: 'NewPass2!',
    });

    expect(result.success).toBe(true);
  });

  it('rejects when confirmation does not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass2!',
      confirmPassword: 'Different!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects when new password equals current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'SamePass1!',
      newPassword: 'SamePass1!',
      confirmPassword: 'SamePass1!',
    });

    expect(result.success).toBe(false);
  });
});

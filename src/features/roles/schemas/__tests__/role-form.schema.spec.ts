import { describe, expect, it } from 'vitest';
import {
  createRoleSchema,
  toCreateRoleDto,
} from '@/features/roles/schemas/role-form.schema';

describe('createRoleSchema', () => {
  it('accepts valid role input', () => {
    const parsed = createRoleSchema.parse({
      code: 'SUPPORT',
      name: 'Support',
      permissions: ['view_all_orders'],
    });

    expect(toCreateRoleDto(parsed)).toEqual({
      code: 'SUPPORT',
      name: 'Support',
      permissions: ['view_all_orders'],
    });
  });

  it('rejects invalid role codes', () => {
    expect(() =>
      createRoleSchema.parse({
        code: 'support',
        name: 'Support',
        permissions: ['view_all_orders'],
      }),
    ).toThrow();
  });
});

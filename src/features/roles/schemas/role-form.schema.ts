import { z } from 'zod';
import type { CreateRoleDto, UpdateRoleDto } from '@/features/roles/types';

const roleCodeSchema = z
  .string()
  .trim()
  .min(1, 'Code is required')
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    'Code must be uppercase letters, digits, and underscores',
  );

export const createRoleSchema = z.object({
  code: roleCodeSchema,
  name: z.string().trim().min(1, 'Name is required'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

export function toCreateRoleDto(values: CreateRoleFormValues): CreateRoleDto {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    permissions: values.permissions,
  };
}

export function toUpdateRoleDto(values: UpdateRoleFormValues): UpdateRoleDto {
  return {
    name: values.name.trim(),
    permissions: values.permissions,
  };
}

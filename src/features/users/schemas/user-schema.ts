import { z } from 'zod';
import type { UpdateUserDto } from '@/features/users/types';

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export function toUpdateUserDto(values: UpdateUserFormValues): UpdateUserDto {
  const phone = values.phone?.trim();
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: phone && phone.length > 0 ? phone : undefined,
  };
}

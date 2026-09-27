import { z } from 'zod';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/features/products/types';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

function trimOrUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function toCreateCategoryDto(
  values: CategoryFormValues,
): CreateCategoryDto {
  const slug = trimOrUndefined(values.slug);
  const description = trimOrUndefined(values.description);

  return {
    name: values.name.trim(),
    ...(slug ? { slug } : {}),
    ...(description ? { description } : {}),
  };
}

export function toUpdateCategoryDto(
  values: CategoryFormValues,
): UpdateCategoryDto {
  return toCreateCategoryDto(values);
}

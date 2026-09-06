import { z } from 'zod';
import type {
  CreateProductDto,
  UpdateProductDto,
} from '@/features/products/types';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      'Price must be greater than zero',
    ),
  slug: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  currency: z
    .string()
    .trim()
    .min(1, 'Currency is required'),
  imageUrl: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        value.trim().length === 0 ||
        z.string().url().safeParse(value.trim()).success,
      'Enter a valid URL',
    ),
  categoryId: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0;
    }, 'Category is required'),
});

/** Edit uses the same full-form schema (name + price required with loaded defaults). */
export type ProductFormValues = z.infer<typeof createProductSchema>;

export type ProductSubmitValues = {
  name: string;
  price: number;
  slug?: string;
  description?: string;
  sku?: string;
  currency?: string;
  imageUrl?: string;
  categoryId: number;
};

/** Normalize form values for API DTOs. */
export function toProductSubmitValues(
  values: ProductFormValues,
): ProductSubmitValues {
  const trimOrUndefined = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    name: values.name.trim(),
    price: Number(values.price),
    slug: trimOrUndefined(values.slug),
    description: trimOrUndefined(values.description),
    sku: trimOrUndefined(values.sku),
    currency: trimOrUndefined(values.currency),
    imageUrl: trimOrUndefined(values.imageUrl),
    categoryId: Number(values.categoryId),
  };
}

export function toCreateProductDto(
  values: ProductSubmitValues,
): CreateProductDto {
  return {
    name: values.name,
    price: values.price,
    categoryId: values.categoryId,
    ...(values.slug ? { slug: values.slug } : {}),
    ...(values.description ? { description: values.description } : {}),
    ...(values.sku ? { sku: values.sku } : {}),
    ...(values.currency ? { currency: values.currency } : {}),
    ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
  };
}

export function toUpdateProductDto(
  values: ProductSubmitValues,
): UpdateProductDto {
  return {
    name: values.name,
    price: values.price,
    ...(values.slug !== undefined ? { slug: values.slug } : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    ...(values.sku !== undefined ? { sku: values.sku } : {}),
    ...(values.currency !== undefined ? { currency: values.currency } : {}),
    ...(values.imageUrl !== undefined ? { imageUrl: values.imageUrl } : {}),
    ...(values.categoryId !== undefined
      ? { categoryId: values.categoryId }
      : {}),
  };
}

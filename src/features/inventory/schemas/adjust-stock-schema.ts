import { z } from 'zod';
import type { AdjustStockDto } from '@/features/inventory/types';

export const adjustStockSchema = z.object({
  type: z.enum(['ADD', 'SUBTRACT', 'SET'], {
    message: 'Select an adjustment type',
  }),
  quantity: z
    .string()
    .trim()
    .min(1, 'Quantity is required')
    .refine(
      (value) => {
        const n = Number(value);
        return Number.isInteger(n) && n > 0;
      },
      'Quantity must be a positive whole number',
    ),
  reason: z.string().optional(),
});

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

export function toAdjustStockDto(
  values: AdjustStockFormValues,
): AdjustStockDto {
  const reason = values.reason?.trim();
  return {
    type: values.type,
    quantity: Number(values.quantity),
    ...(reason ? { reason } : {}),
  };
}

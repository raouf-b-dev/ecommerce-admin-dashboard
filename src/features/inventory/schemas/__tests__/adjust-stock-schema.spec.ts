import { describe, expect, it } from 'vitest';
import {
  adjustStockSchema,
  toAdjustStockDto,
} from '@/features/inventory/schemas/adjust-stock-schema';

describe('adjustStockSchema', () => {
  it('rejects empty quantity', () => {
    const result = adjustStockSchema.safeParse({
      type: 'ADD',
      quantity: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive quantity', () => {
    const result = adjustStockSchema.safeParse({
      type: 'SUBTRACT',
      quantity: '0',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid adjustment and maps to DTO', () => {
    const result = adjustStockSchema.safeParse({
      type: 'SET',
      quantity: '25',
      reason: '  Restock  ',
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(toAdjustStockDto(result.data)).toEqual({
      type: 'SET',
      quantity: 25,
      reason: 'Restock',
    });
  });

  it('omits empty reason from DTO', () => {
    const result = adjustStockSchema.safeParse({
      type: 'ADD',
      quantity: '5',
      reason: '   ',
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(toAdjustStockDto(result.data)).toEqual({
      type: 'ADD',
      quantity: 5,
    });
  });
});

import { describe, expect, it } from 'vitest';
import {
  createProductSchema,
  toCreateProductDto,
  toProductSubmitValues,
  toUpdateProductDto,
} from '@/features/products/schemas/product-schema';

describe('createProductSchema', () => {
  it('requires name and positive price', () => {
    const result = createProductSchema.safeParse({
      name: '',
      price: '',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid create payload', () => {
    const result = createProductSchema.safeParse({
      name: 'Laptop',
      price: '49.99',
      currency: 'USD',
      imageUrl: 'https://example.com/laptop.jpg',
      categoryId: '3',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe('49.99');
      const submit = toProductSubmitValues(result.data);
      expect(submit).toMatchObject({
        name: 'Laptop',
        price: 49.99,
        categoryId: 3,
        imageUrl: 'https://example.com/laptop.jpg',
      });
      expect(toCreateProductDto(submit)).toMatchObject({
        name: 'Laptop',
        price: 49.99,
        categoryId: 3,
      });
      expect(toUpdateProductDto(submit)).toMatchObject({
        name: 'Laptop',
        price: 49.99,
      });
    }
  });

  it('rejects invalid image URL', () => {
    const result = createProductSchema.safeParse({
      name: 'Laptop',
      price: '10',
      imageUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });
});

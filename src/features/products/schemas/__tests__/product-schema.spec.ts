import { describe, expect, it } from 'vitest';
import {
  createProductFormSchema,
  createProductSchema,
  priceFitsCurrencyExponent,
  toCreateProductDto,
  toProductSubmitValues,
  toUpdateProductDto,
} from '@/features/products/schemas/product-schema';

describe('createProductSchema', () => {
  it('requires name, positive price, and category', () => {
    const result = createProductSchema.safeParse({
      name: '',
      price: '',
      categoryId: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing category', () => {
    const result = createProductSchema.safeParse({
      name: 'Laptop',
      price: '10',
      currency: 'USD',
      categoryId: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'categoryId'))
        .toBe(true);
    }
  });

  it('rejects non-positive category id', () => {
    const result = createProductSchema.safeParse({
      name: 'Laptop',
      price: '10',
      currency: 'USD',
      categoryId: '0',
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
      expect(toCreateProductDto(submit)).toEqual(
        expect.objectContaining({
          name: 'Laptop',
          price: 49.99,
          categoryId: 3,
        }),
      );
      expect(toCreateProductDto(submit).categoryId).toBe(3);
      expect(toUpdateProductDto(submit)).toMatchObject({
        name: 'Laptop',
        price: 49.99,
      });
    }
  });

  it('rejects missing or invalid currency', () => {
    expect(
      createProductSchema.safeParse({
        name: 'Laptop',
        price: '10',
        currency: '',
        categoryId: '1',
      }).success,
    ).toBe(false);

    expect(
      createProductSchema.safeParse({
        name: 'Laptop',
        price: '10',
        currency: 'US',
        categoryId: '1',
      }).success,
    ).toBe(false);

    expect(
      createProductSchema.safeParse({
        name: 'Laptop',
        price: '10',
        currency: 'USDT',
        categoryId: '1',
      }).success,
    ).toBe(false);
  });

  it.each(['not-a-url', 'ftp://files.example.com/a.jpg', 'javascript:alert(1)'])(
    'rejects image URL %p',
    (imageUrl) => {
      const result = createProductSchema.safeParse({
        name: 'Laptop',
        price: '10',
        currency: 'USD',
        imageUrl,
      });

      expect(result.success).toBe(false);
    },
  );

  it('trims and uppercases currency in both create and update DTOs', () => {
    const submit = toProductSubmitValues({
      name: 'Laptop',
      price: '10',
      currency: ' eur ',
      categoryId: '3',
    });

    expect(submit).toMatchObject({ currency: 'EUR' });
    expect(toCreateProductDto(submit)).toMatchObject({ currency: 'EUR' });
    expect(toUpdateProductDto(submit)).toMatchObject({ currency: 'EUR' });
  });
});

describe('priceFitsCurrencyExponent', () => {
  it.each([
    ['49.99', 2, true],
    ['49.999', 2, false],
    ['49.990', 2, true],
    ['100', 0, true],
    ['100.1', 0, false],
  ])('treats %s at exponent %i as valid=%s', (price, exponent, expected) => {
    expect(priceFitsCurrencyExponent(price, exponent)).toBe(expected);
  });
});

describe('createProductFormSchema', () => {
  it('rejects excess scale for the default currency', () => {
    const schema = createProductFormSchema({
      defaultCurrency: 'USD',
      defaultCurrencyExponent: 2,
    });

    expect(
      schema.safeParse({
        name: 'Laptop',
        price: '49.999',
        currency: 'USD',
        categoryId: '1',
      }),
    ).toMatchObject({ success: false });
  });

  it('skips scale checks for a non-default currency', () => {
    const schema = createProductFormSchema({
      defaultCurrency: 'USD',
      defaultCurrencyExponent: 2,
    });

    expect(
      schema.safeParse({
        name: 'Laptop',
        price: '49.999',
        currency: 'EUR',
        categoryId: '1',
      }),
    ).toMatchObject({ success: true });
  });
});

import { describe, expect, it } from 'vitest';
import {
  toAddAddressDto,
  toUpdateAddressDto,
  type AddressFormValues,
} from '@/features/users/schemas/address-schema';

const values: AddressFormValues = {
  street: ' 10 Integration Way ',
  street2: ' ',
  city: 'Algiers',
  state: 'Algiers',
  postalCode: '16000',
  country: 'DZ',
  deliveryInstructions: '',
  isDefault: true,
};

describe('address DTO mappers', () => {
  it('includes isDefault on add and omits empty optional text', () => {
    expect(toAddAddressDto(values)).toEqual({
      street: '10 Integration Way',
      city: 'Algiers',
      state: 'Algiers',
      postalCode: '16000',
      country: 'DZ',
      isDefault: true,
    });
  });

  it('strips isDefault from the update payload', () => {
    expect(toUpdateAddressDto(values)).toEqual({
      street: '10 Integration Way',
      city: 'Algiers',
      state: 'Algiers',
      postalCode: '16000',
      country: 'DZ',
    });
    expect(toUpdateAddressDto(values)).not.toHaveProperty('isDefault');
    expect(toUpdateAddressDto(values)).not.toHaveProperty('type');
  });
});

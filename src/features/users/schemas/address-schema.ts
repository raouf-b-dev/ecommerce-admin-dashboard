import { z } from 'zod';
import type { AddAddressDto, UpdateAddressDto } from '@/features/users/types';

export const addressFormSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  street2: z.string().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  country: z.string().trim().min(1, 'Country is required'),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function toAddAddressDto(values: AddressFormValues): AddAddressDto {
  return {
    street: values.street.trim(),
    street2: optionalText(values.street2),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
    deliveryInstructions: optionalText(values.deliveryInstructions),
    ...(values.isDefault === true ? { isDefault: true } : {}),
  };
}

export function toUpdateAddressDto(values: AddressFormValues): UpdateAddressDto {
  return {
    street: values.street.trim(),
    street2: optionalText(values.street2),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
    deliveryInstructions: optionalText(values.deliveryInstructions),
  };
}

export const emptyAddressFormValues: AddressFormValues = {
  street: '',
  street2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  deliveryInstructions: '',
  isDefault: false,
};

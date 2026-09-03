import {
  createSeedInventory,
  createSeedOrders,
  createSeedPayments,
  createSeedPermissions,
  createSeedProducts,
  createSeedRoles,
  createSeedUsers,
  type SeedInventoryRow,
} from '@/lib/mock/data/seed';
import type {
  OrderDetailResponseDto,
  PaymentDetailResponseDto,
  PermissionResponseDto,
  ProductDetailResponseDto,
  RoleResponseDto,
  UserDetailResponseDto,
} from '@/lib/mock/data/types';

const MOCK_SESSION_KEY = 'es_admin_mock_session'; // flag for refresh presence only — not access-token persistence

export type MockStore = {
  products: ProductDetailResponseDto[];
  inventory: SeedInventoryRow[];
  users: UserDetailResponseDto[];
  orders: OrderDetailResponseDto[];
  payments: PaymentDetailResponseDto[];
  roles: RoleResponseDto[];
  permissions: PermissionResponseDto[];
  nextProductId: number;
  nextUserAddressId: number;
  nextRoleId: number;
};

function cloneSeed(): MockStore {
  const products = structuredClone(createSeedProducts());
  const inventory = structuredClone(createSeedInventory());
  const users = structuredClone(createSeedUsers());
  const orders = structuredClone(createSeedOrders());
  const payments = structuredClone(createSeedPayments());
  const roles = structuredClone(createSeedRoles());
  const permissions = structuredClone(createSeedPermissions());

  return {
    products,
    inventory,
    users,
    orders,
    payments,
    roles,
    permissions,
    nextProductId: Math.max(...products.map((p) => p.id)) + 1,
    nextUserAddressId:
      Math.max(
        0,
        ...users.flatMap((user) => user.addresses.map((a) => a.id)),
      ) + 1,
    nextRoleId: Math.max(...roles.map((r) => r.id)) + 1,
  };
}

let store: MockStore = cloneSeed();

export function getMockStore(): MockStore {
  return store;
}

export function resetMockStore(): void {
  store = cloneSeed();
}

const MOCK_USER_EMAIL_KEY = 'es_admin_mock_user_email';

export function isMockSessionActive(): boolean {
  try {
    return sessionStorage.getItem(MOCK_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function getMockSessionUserEmail(): string | null {
  try {
    return sessionStorage.getItem(MOCK_USER_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function setMockSessionActive(active: boolean, userEmail?: string): void {
  try {
    if (active) {
      sessionStorage.setItem(MOCK_SESSION_KEY, '1');
      if (userEmail) {
        sessionStorage.setItem(MOCK_USER_EMAIL_KEY, userEmail);
      }
    } else {
      sessionStorage.removeItem(MOCK_SESSION_KEY);
      sessionStorage.removeItem(MOCK_USER_EMAIL_KEY);
    }
  } catch {
    // Ignore quota / private-mode failures in demo mode.
  }
}

export function isoNow(): string {
  return new Date().toISOString();
}

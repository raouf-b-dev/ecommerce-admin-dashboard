import { analyticsHandlers } from '@/lib/mock/handlers/analytics';
import { authHandlers } from '@/lib/mock/handlers/auth';
import { inventoryHandlers } from '@/lib/mock/handlers/inventory';
import { ordersHandlers } from '@/lib/mock/handlers/orders';
import { paymentsHandlers } from '@/lib/mock/handlers/payments';
import { productsHandlers } from '@/lib/mock/handlers/products';
import { rolesHandlers } from '@/lib/mock/handlers/roles';
import { usersHandlers } from '@/lib/mock/handlers/users';

export const handlers = [
  ...authHandlers,
  ...productsHandlers,
  ...ordersHandlers,
  ...paymentsHandlers,
  ...inventoryHandlers,
  ...usersHandlers,
  ...rolesHandlers,
  ...analyticsHandlers,
];

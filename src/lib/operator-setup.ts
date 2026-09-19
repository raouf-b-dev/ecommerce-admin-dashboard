import { hasPermission } from '@/lib/auth/permissions';

export type OperatorSetupStepStatus = 'ready' | 'locked' | 'forbidden';

export type OperatorSetupStepView = {
  id: string;
  title: string;
  description: string;
  status: OperatorSetupStepStatus;
  href?: string;
  statusLabel?: string;
};

export function buildOperatorSetupSteps(
  permissions: string[],
  productCount: number,
): OperatorSetupStepView[] {
  const canManageProducts = hasPermission(permissions, 'manage_products');
  const canManageInventory = hasPermission(permissions, 'manage_inventory');
  const canManageRoles = hasPermission(permissions, 'manage_roles');

  const productStep: OperatorSetupStepView = canManageProducts
    ? {
        id: 'product',
        title: 'Add your first product',
        description: 'Create a catalog item customers can browse and buy.',
        status: 'ready',
        href: '/products/new',
      }
    : {
        id: 'product',
        title: 'Add your first product',
        description: 'Create a catalog item customers can browse and buy.',
        status: 'forbidden',
        statusLabel: 'Requires permission',
      };

  const inventoryStep: OperatorSetupStepView =
    productCount <= 0
      ? {
          id: 'inventory',
          title: 'Adjust stock levels',
          description: 'Set warehouse quantity after you have at least one product.',
          status: 'locked',
          statusLabel: 'Locked (requires at least one product)',
        }
      : canManageInventory
        ? {
            id: 'inventory',
            title: 'Adjust stock levels',
            description: 'Open inventory and set quantity for each product.',
            status: 'ready',
            href: '/inventory',
          }
        : {
            id: 'inventory',
            title: 'Adjust stock levels',
            description: 'Open inventory and set quantity for each product.',
            status: 'forbidden',
            statusLabel: 'Requires permission',
          };

  const rolesStep: OperatorSetupStepView = canManageRoles
    ? {
        id: 'roles',
        title: 'Review roles and permissions',
        description: 'Confirm operator access before handing out accounts.',
        status: 'ready',
        href: '/settings/roles',
      }
    : {
        id: 'roles',
        title: 'Review roles and permissions',
        description: 'Confirm operator access before handing out accounts.',
        status: 'forbidden',
        statusLabel: 'Requires permission',
      };

  return [productStep, inventoryStep, rolesStep];
}

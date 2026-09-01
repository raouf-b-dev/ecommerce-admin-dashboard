import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
};

export const navigation: NavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: 'view_all_orders',
  },
  {
    to: '/products',
    label: 'Products',
    icon: Package,
    permission: 'view_all_products',
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: Warehouse,
    permission: 'view_all_inventory',
  },
  {
    to: '/orders',
    label: 'Orders',
    icon: ShoppingCart,
    permission: 'view_all_orders',
  },
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    permission: 'view_all_users',
  },
];

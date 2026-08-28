import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Shield,
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
    to: '/orders',
    label: 'Orders',
    icon: ShoppingCart,
    permission: 'view_all_orders',
  },
  {
    to: '/settings/roles',
    label: 'Roles',
    icon: Shield,
    permission: 'manage_roles',
  },
];

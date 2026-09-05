import {
  DEMO_ADMIN_EMAIL,
  DEMO_OPERATOR_PERMISSIONS,
} from '@/lib/mock/constants';
import type {
  AddressResponseDto,
  CategoryResponseDto,
  InventoryListItemResponseDto,
  OrderDetailResponseDto,
  PaymentDetailResponseDto,
  PermissionResponseDto,
  ProductDetailResponseDto,
  RoleResponseDto,
  UserDetailResponseDto,
} from '@/lib/mock/data/types';

const now = '2026-03-01T12:00:00.000Z';

export type SeedInventoryRow = InventoryListItemResponseDto & {
  lowStockThreshold: number;
};

const productDefs: Array<{
  id: number;
  name: string;
  sku: string;
  price: number;
  categoryId: number;
  isActive: boolean;
  description: string;
  stock: number;
  reserved: number;
  lowThreshold: number;
}> = [
  {
    id: 1,
    name: 'Wireless Noise-Canceling Headphones',
    sku: 'ELEC-ANC-001',
    price: 199.99,
    categoryId: 1,
    isActive: true,
    description:
      'High-fidelity over-ear headphones with active noise cancellation and 30-hour battery life.',
    stock: 150,
    reserved: 3,
    lowThreshold: 15,
  },
  {
    id: 2,
    name: 'Smart Fitness Watch v2',
    sku: 'ELEC-SFW-002',
    price: 129.5,
    categoryId: 1,
    isActive: true,
    description:
      'Waterproof smart watch with heart rate monitor, sleep tracking, and built-in GPS.',
    stock: 45,
    reserved: 1,
    lowThreshold: 10,
  },
  {
    id: 3,
    name: '4K Ultra HD Portable Projector',
    sku: 'ELEC-PRJ-003',
    price: 349,
    categoryId: 1,
    isActive: true,
    description:
      'Mini LED projector with built-in speakers, HDMI, and screen mirroring capability.',
    stock: 8,
    reserved: 0,
    lowThreshold: 10,
  },
  {
    id: 4,
    name: 'Mechanical Backlit Keyboard',
    sku: 'ELEC-MBK-004',
    price: 79.99,
    categoryId: 1,
    isActive: true,
    description:
      'Wired gaming keyboard with customizable RGB backlighting and tactile blue switches.',
    stock: 120,
    reserved: 2,
    lowThreshold: 15,
  },
  {
    id: 5,
    name: 'Ergonomic Wireless Mouse',
    sku: 'ELEC-EWM-005',
    price: 24.95,
    categoryId: 1,
    isActive: true,
    description:
      '2.4GHz wireless mouse with adjustable DPI and comfortable contoured grip.',
    stock: 0,
    reserved: 0,
    lowThreshold: 5,
  },
  {
    id: 6,
    name: 'Unisex Organic Cotton Hoodie',
    sku: 'CLOT-OCH-001',
    price: 55,
    categoryId: 2,
    isActive: true,
    description:
      'Ultra-soft fleece hoodie made from 100% certified organic cotton. Pre-shrunk.',
    stock: 250,
    reserved: 5,
    lowThreshold: 20,
  },
  {
    id: 7,
    name: 'Classic Denim Jacket',
    sku: 'CLOT-CDJ-002',
    price: 68,
    categoryId: 2,
    isActive: false,
    description:
      'Timeless button-front jean jacket with a regular fit and four functional pockets.',
    stock: 35,
    reserved: 0,
    lowThreshold: 10,
  },
  {
    id: 8,
    name: 'Breathable Running Socks (3-Pack)',
    sku: 'CLOT-BRS-003',
    price: 14.99,
    categoryId: 2,
    isActive: true,
    description:
      'Moisture-wicking athletic ankle socks with arch support and cushioned soles.',
    stock: 3,
    reserved: 0,
    lowThreshold: 5,
  },
  {
    id: 9,
    name: 'Self-Watering Ceramic Planter',
    sku: 'HOME-SCP-001',
    price: 32.5,
    categoryId: 3,
    isActive: true,
    description:
      'Stylish terracotta-lined planter with a built-in reservoir to keep plants hydrated.',
    stock: 80,
    reserved: 1,
    lowThreshold: 12,
  },
  {
    id: 10,
    name: 'Stainless Steel French Press',
    sku: 'HOME-SFP-002',
    price: 39.99,
    categoryId: 3,
    isActive: true,
    description:
      'Double-walled insulated coffee maker with a 4-level filtration system.',
    stock: 25,
    reserved: 0,
    lowThreshold: 8,
  },
  {
    id: 11,
    name: 'Ultrasonic Cool Mist Humidifier',
    sku: 'HOME-UCH-003',
    price: 45.9,
    categoryId: 3,
    isActive: true,
    description:
      'Whisper-quiet air humidifier with automatic shut-off and nightlight function.',
    stock: 0,
    reserved: 0,
    lowThreshold: 5,
  },
  {
    id: 12,
    name: 'Eco-Friendly TPE Yoga Mat',
    sku: 'SPOR-EYM-001',
    price: 29.99,
    categoryId: 4,
    isActive: true,
    description:
      'Non-slip 6mm thick workout mat with alignment lines, carrying strap included.',
    stock: 110,
    reserved: 4,
    lowThreshold: 15,
  },
  {
    id: 13,
    name: 'Insulated Sports Water Bottle',
    sku: 'SPOR-IWB-002',
    price: 19.99,
    categoryId: 4,
    isActive: true,
    description:
      'Vacuum-insulated stainless steel bottle that keeps drinks cold for 24 hours.',
    stock: 40,
    reserved: 2,
    lowThreshold: 10,
  },
  {
    id: 14,
    name: 'The Art of Clean Code',
    sku: 'BOOK-ACC-001',
    price: 28.5,
    categoryId: 5,
    isActive: true,
    description:
      'A comprehensive guide to software design principles, refactoring, and craftsmanship.',
    stock: 30,
    reserved: 0,
    lowThreshold: 5,
  },
  {
    id: 15,
    name: 'Designing Data-Intensive Systems',
    sku: 'BOOK-DDS-002',
    price: 42,
    categoryId: 5,
    isActive: true,
    description:
      'Explore the principles, algorithms, and trade-offs of modern backend architectures.',
    stock: 4,
    reserved: 0,
    lowThreshold: 5,
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const seedCategories: CategoryResponseDto[] = [
  { id: 1, name: 'Electronics', slug: 'electronics', description: null, isActive: true },
  { id: 2, name: 'Clothing', slug: 'clothing', description: null, isActive: true },
  { id: 3, name: 'Home & Garden', slug: 'home-garden', description: null, isActive: true },
  { id: 4, name: 'Sports', slug: 'sports', description: null, isActive: true },
  { id: 5, name: 'Books', slug: 'books', description: null, isActive: true },
];

function categoryNameForId(categoryId: number): string | null {
  return seedCategories.find((category) => category.id === categoryId)?.name ?? null;
}

export function createSeedCategories(): CategoryResponseDto[] {
  return seedCategories.map((category) => ({ ...category }));
}

export function createSeedProducts(): ProductDetailResponseDto[] {
  return productDefs.map((product) => ({
    id: product.id,
    name: product.name,
    slug: slugify(product.name),
    sku: product.sku,
    price: product.price,
    currency: 'USD',
    imageUrl: null,
    categoryId: product.categoryId,
    categoryName: categoryNameForId(product.categoryId),
    isActive: product.isActive,
    createdAt: now,
    description: product.description,
    updatedAt: now,
  }));
}

export function createSeedInventory(): SeedInventoryRow[] {
  return productDefs.map((product) => ({
    id: product.id,
    productId: product.id,
    sku: product.sku,
    productTitle: product.name,
    availableQuantity: product.stock,
    reservedQuantity: product.reserved,
    totalQuantity: product.stock + product.reserved,
    updatedAt: now,
    lowStockThreshold: product.lowThreshold,
  }));
}

export function createSeedUsers(): UserDetailResponseDto[] {
  const customerAddresses: AddressResponseDto[] = [
    {
      id: 1,
      street: '123 Tech Boulevard',
      street2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
      type: 'HOME',
      isDefault: true,
      deliveryInstructions: 'Leave with concierge',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      street: '500 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'US',
      type: 'WORK',
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return [
    {
      id: 1,
      firstName: 'Store',
      lastName: 'Admin',
      email: DEMO_ADMIN_EMAIL,
      phone: '+15550100',
      isActive: true,
      roleCode: 'ADMIN',
      createdAt: now,
      addressCount: 0,
      addresses: [],
      updatedAt: now,
    },
    {
      id: 2,
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@store.local',
      phone: '+15550101',
      isActive: true,
      roleCode: 'SUPER_ADMIN',
      createdAt: now,
      addressCount: 0,
      addresses: [],
      updatedAt: now,
    },
    {
      id: 3,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'customer@store.local',
      phone: '+15550102',
      isActive: true,
      roleCode: 'CUSTOMER',
      createdAt: now,
      addressCount: customerAddresses.length,
      addresses: customerAddresses,
      updatedAt: now,
    },
    {
      id: 4,
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@example.com',
      phone: null,
      isActive: false,
      roleCode: 'CUSTOMER',
      createdAt: '2025-11-15T09:00:00.000Z',
      addressCount: 0,
      addresses: [],
      updatedAt: now,
    },
  ];
}

export function createSeedOrders(): OrderDetailResponseDto[] {
  return [
    {
      id: 1,
      orderNumber: 'ORD-2026-0001',
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      status: 'confirmed',
      shippingAddress:
        'Jane Doe, 123 Tech Boulevard, San Francisco, CA 94105, US',
      items: [
        {
          productId: 1,
          sku: 'ELEC-ANC-001',
          title: 'Wireless Noise-Canceling Headphones',
          unitPrice: 199.99,
          quantity: 1,
          subtotal: 199.99,
        },
        {
          productId: 4,
          sku: 'ELEC-MBK-004',
          title: 'Mechanical Backlit Keyboard',
          unitPrice: 79.99,
          quantity: 1,
          subtotal: 79.99,
        },
      ],
      totalAmount: 279.98,
      totalPrice: 279.98,
      currency: 'USD',
      createdAt: '2026-02-28T10:15:00.000Z',
      updatedAt: '2026-02-28T10:20:00.000Z',
    },
    {
      id: 2,
      orderNumber: 'ORD-2026-0002',
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      status: 'processing',
      shippingAddress:
        'Jane Doe, 123 Tech Boulevard, San Francisco, CA 94105, US',
      items: [
        {
          productId: 3,
          sku: 'ELEC-PRJ-003',
          title: '4K Ultra HD Portable Projector',
          unitPrice: 349,
          quantity: 1,
          subtotal: 349,
        },
      ],
      totalAmount: 349,
      totalPrice: 349,
      currency: 'USD',
      createdAt: '2026-02-25T14:00:00.000Z',
      updatedAt: '2026-02-26T09:00:00.000Z',
    },
    {
      id: 3,
      orderNumber: 'ORD-2026-0003',
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      status: 'pending_payment',
      shippingAddress:
        'Jane Doe, 500 Market Street, San Francisco, CA 94102, US',
      items: [
        {
          productId: 9,
          sku: 'HOME-SCP-001',
          title: 'Self-Watering Ceramic Planter',
          unitPrice: 32.5,
          quantity: 1,
          subtotal: 32.5,
        },
      ],
      totalAmount: 32.5,
      totalPrice: 32.5,
      currency: 'USD',
      createdAt: '2026-03-01T08:30:00.000Z',
      updatedAt: '2026-03-01T08:30:00.000Z',
    },
    {
      id: 4,
      orderNumber: 'ORD-2026-0004',
      userId: 4,
      userName: 'Alex Rivera',
      userEmail: 'alex.rivera@example.com',
      status: 'shipped',
      shippingAddress: 'Alex Rivera, 88 Pine Ave, Austin, TX 78701, US',
      items: [
        {
          productId: 6,
          sku: 'CLOT-OCH-001',
          title: 'Unisex Organic Cotton Hoodie',
          unitPrice: 55,
          quantity: 2,
          subtotal: 110,
        },
        {
          productId: 7,
          sku: 'CLOT-CDJ-002',
          title: 'Classic Denim Jacket',
          unitPrice: 68,
          quantity: 1,
          subtotal: 68,
        },
      ],
      totalAmount: 178,
      totalPrice: 178,
      currency: 'USD',
      createdAt: '2026-02-20T16:45:00.000Z',
      updatedAt: '2026-02-22T11:00:00.000Z',
    },
    {
      id: 5,
      orderNumber: 'ORD-2026-0005',
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      status: 'delivered',
      shippingAddress:
        'Jane Doe, 123 Tech Boulevard, San Francisco, CA 94105, US',
      items: [
        {
          productId: 10,
          sku: 'HOME-SFP-002',
          title: 'Stainless Steel French Press',
          unitPrice: 39.99,
          quantity: 1,
          subtotal: 39.99,
        },
        {
          productId: 14,
          sku: 'BOOK-ACC-001',
          title: 'The Art of Clean Code',
          unitPrice: 28.5,
          quantity: 1,
          subtotal: 28.5,
        },
      ],
      totalAmount: 68.49,
      totalPrice: 68.49,
      currency: 'USD',
      createdAt: '2026-02-10T12:00:00.000Z',
      updatedAt: '2026-02-14T18:00:00.000Z',
    },
    {
      id: 6,
      orderNumber: 'ORD-2026-0006',
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      status: 'cancelled',
      shippingAddress:
        'Jane Doe, 123 Tech Boulevard, San Francisco, CA 94105, US',
      items: [
        {
          productId: 5,
          sku: 'ELEC-EWM-005',
          title: 'Ergonomic Wireless Mouse',
          unitPrice: 24.95,
          quantity: 1,
          subtotal: 24.95,
        },
      ],
      totalAmount: 24.95,
      totalPrice: 24.95,
      currency: 'USD',
      createdAt: '2026-02-05T09:20:00.000Z',
      updatedAt: '2026-02-05T10:00:00.000Z',
    },
  ];
}

export function createSeedPayments(): PaymentDetailResponseDto[] {
  return [
    {
      id: 1,
      orderId: 1,
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      amount: 279.98,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      transactionId: 'txn_mock_001',
      createdAt: '2026-02-28T10:18:00.000Z',
      gatewayPaymentIntentId: 'pi_mock_001',
      failureReason: null,
      metadata: null,
      updatedAt: '2026-02-28T10:18:00.000Z',
    },
    {
      id: 2,
      orderId: 2,
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      amount: 349,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      transactionId: 'txn_mock_002',
      createdAt: '2026-02-25T14:05:00.000Z',
      gatewayPaymentIntentId: 'pi_mock_002',
      failureReason: null,
      metadata: null,
      updatedAt: '2026-02-25T14:05:00.000Z',
    },
    {
      id: 4,
      orderId: 4,
      userId: 4,
      userName: 'Alex Rivera',
      userEmail: 'alex.rivera@example.com',
      amount: 178,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      transactionId: 'txn_mock_004',
      createdAt: '2026-02-20T16:50:00.000Z',
      gatewayPaymentIntentId: 'pi_mock_004',
      failureReason: null,
      metadata: null,
      updatedAt: '2026-02-20T16:50:00.000Z',
    },
    {
      id: 5,
      orderId: 5,
      userId: 3,
      userName: 'Jane Doe',
      userEmail: 'customer@store.local',
      amount: 68.49,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      transactionId: 'txn_mock_005',
      createdAt: '2026-02-10T12:05:00.000Z',
      gatewayPaymentIntentId: 'pi_mock_005',
      failureReason: null,
      metadata: null,
      updatedAt: '2026-02-10T12:05:00.000Z',
    },
  ];
}

export function createSeedPermissions(): PermissionResponseDto[] {
  return [
    { id: 1, code: 'access_admin', description: 'Access the admin dashboard' },
    { id: 2, code: 'view_all_orders', description: 'View all orders' },
    { id: 3, code: 'view_all_products', description: 'View all products' },
    { id: 4, code: 'view_all_inventory', description: 'View inventory' },
    { id: 5, code: 'view_all_users', description: 'View all users' },
    { id: 6, code: 'view_all_payments', description: 'View payments' },
    { id: 7, code: 'manage_products', description: 'Manage products' },
    { id: 8, code: 'manage_orders', description: 'Process, ship, and cancel orders' },
    { id: 9, code: 'manage_inventory', description: 'Adjust and manage inventory stock' },
    { id: 10, code: 'manage_users', description: 'Manage users' },
    { id: 11, code: 'manage_roles', description: 'Manage roles' },
  ];
}

export function createSeedRoles(): RoleResponseDto[] {
  return [
    {
      id: 1,
      code: 'CUSTOMER',
      name: 'Customer',
      isSystem: true,
      permissions: { codes: [] },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      code: 'ADMIN',
      name: 'Admin',
      isSystem: true,
      permissions: { codes: [...DEMO_OPERATOR_PERMISSIONS] as string[] },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      isSystem: true,
      permissions: { codes: [...DEMO_OPERATOR_PERMISSIONS] as string[] },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

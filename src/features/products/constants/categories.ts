export type ProductCategory = {
  id: number;
  name: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Home & Office' },
  { id: 3, name: 'Outdoors & Travel' },
  { id: 4, name: 'Fitness' },
];

export function getCategoryName(categoryId?: number | null): string {
  if (categoryId == null) return '—';
  const found = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return found ? found.name : `Category #${categoryId}`;
}

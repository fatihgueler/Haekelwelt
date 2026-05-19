// Client-safe constants + types for product listing. Wird sowohl von
// Server Components (lib/products.ts) als auch von Client Components
// (components/storefront/product-sort.tsx) importiert.

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'title_asc';

export const PRODUCT_SORTS: ReadonlyArray<{ value: ProductSort; label: string }> = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'price_asc', label: 'Preis aufsteigend' },
  { value: 'price_desc', label: 'Preis absteigend' },
  { value: 'title_asc', label: 'Name (A–Z)' },
];

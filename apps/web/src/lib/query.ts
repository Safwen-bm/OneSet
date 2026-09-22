import type { ProductQuery } from '@oneset/types';

export const PAGE_SIZE = 12;

export function parseQuery(params: URLSearchParams): ProductQuery & { featured?: boolean } {
  const list = (key: string) => {
    const raw = params.get(key);
    return raw ? raw.split(',').filter(Boolean) : undefined;
  };
  const num = (key: string) => {
    const raw = params.get(key);
    return raw && !Number.isNaN(Number(raw)) ? Number(raw) : undefined;
  };

  return {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    brands: list('brands'),
    tags: list('tags'),
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    minRating: num('minRating'),
    inStock: params.get('inStock') === 'true' || undefined,
    onSale: params.get('onSale') === 'true' || undefined,
    featured: params.get('featured') === 'true' || undefined,
    sort: (params.get('sort') as ProductQuery['sort']) ?? undefined,
    page: num('page') ?? 1,
    pageSize: PAGE_SIZE,
  };
}

export function serializeQuery(query: ProductQuery & { featured?: boolean }): string {
  const params = new URLSearchParams();
  const set = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  };

  set('q', query.q);
  set('category', query.category);
  set('brands', query.brands?.length ? query.brands : undefined);
  set('tags', query.tags?.length ? query.tags : undefined);
  set('minPrice', query.minPrice);
  set('maxPrice', query.maxPrice);
  set('minRating', query.minRating);
  set('inStock', query.inStock);
  set('onSale', query.onSale);
  set('featured', query.featured);
  set('sort', query.sort);
  if (query.page && query.page > 1) set('page', query.page);

  return params.toString();
}

export function countActiveFilters(query: ProductQuery & { featured?: boolean }): number {
  return [
    query.category,
    query.brands?.length,
    query.tags?.length,
    query.minPrice,
    query.maxPrice,
    query.minRating,
    query.inStock,
    query.onSale,
  ].filter(Boolean).length;
}

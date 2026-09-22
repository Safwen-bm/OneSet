'use client';

import type { ProductQuery } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api';

export const catalogKeys = {
  products: (query: ProductQuery & { featured?: boolean }) => ['products', query] as const,
  facets: (query: ProductQuery) => ['facets', query] as const,
  product: (slug: string) => ['product', slug] as const,
  related: (slug: string) => ['related', slug] as const,
  categories: () => ['categories'] as const,
  category: (slug: string) => ['category', slug] as const,
  setups: () => ['setups'] as const,
};

export function useProducts(query: ProductQuery & { featured?: boolean } = {}) {
  return useQuery({
    queryKey: catalogKeys.products(query),
    queryFn: () => catalogApi.products(query),
  });
}

export function useFacets(query: ProductQuery = {}) {
  return useQuery({ queryKey: catalogKeys.facets(query), queryFn: () => catalogApi.facets(query) });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => catalogApi.product(slug),
    enabled: Boolean(slug),
  });
}

export function useRelated(slug: string) {
  return useQuery({
    queryKey: catalogKeys.related(slug),
    queryFn: () => catalogApi.related(slug),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({ queryKey: catalogKeys.categories(), queryFn: () => catalogApi.categories() });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: catalogKeys.category(slug),
    queryFn: () => catalogApi.category(slug),
    enabled: Boolean(slug),
  });
}

export function useSetups() {
  return useQuery({ queryKey: catalogKeys.setups(), queryFn: () => catalogApi.setups() });
}

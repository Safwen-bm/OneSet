'use client';

import { CatalogBrowser } from '@/components/shop/catalog-browser';
import { useCategory } from '@/hooks/use-catalog';

export function CategoryView({ slug }: { slug: string }) {
  const { data, isLoading } = useCategory(slug);

  return (
    <CatalogBrowser
      lockedCategory={slug}
      title={isLoading ? '…' : (data?.name ?? 'Category')}
      description={data?.tagline ?? null}
    />
  );
}

'use client';

import Link from 'next/link';
import { ProductGrid } from '@/components/shop/product-grid';
import { useProducts } from '@/hooks/use-catalog';

export function FeaturedRail() {
  const { data, isLoading } = useProducts({ featured: true, pageSize: 8, sort: 'rating' });

  return (
    <section className="container py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-title">Picked this week</h2>
          <p className="mt-2 max-w-[52ch] text-muted">
            The pieces our own desks ended up with, across every category.
          </p>
        </div>
        <Link href="/shop?featured=true" className="text-sm text-muted transition-colors hover:text-ink">
          See all featured
        </Link>
      </div>

      <ProductGrid products={data?.items} loading={isLoading} skeletonCount={8} />
    </section>
  );
}

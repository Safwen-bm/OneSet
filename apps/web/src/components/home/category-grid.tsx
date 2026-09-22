'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryGrid() {
  const { data, isLoading } = useCategories();

  return (
    <section className="container py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-title">Start with one piece</h2>
        <Link href="/shop" className="text-sm text-muted transition-colors hover:text-ink">
          All products
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex h-24 flex-col justify-between rounded-tile border border-hairline bg-surface p-4 transition-[border-color,transform] duration-200 ease-set hover:-translate-y-0.5 hover:border-ink/30"
            >
              <span className="text-sm font-medium leading-tight">{category.name}</span>
              <span className="text-micro text-muted tabular">
                {category.productCount ?? 0} products
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

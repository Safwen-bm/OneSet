import type { Product } from '@oneset/types';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
  className,
}: {
  products?: Product[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4', className)}>
      {products?.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}

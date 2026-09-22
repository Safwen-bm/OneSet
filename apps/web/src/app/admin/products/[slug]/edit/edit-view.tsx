'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { catalogApi } from '@/lib/api';
import { ProductForm } from '../../product-form';

export function EditProductView({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['admin', 'product', slug],
    queryFn: () => catalogApi.product(slug),
  });

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted transition-colors hover:text-ink">
        ← Products
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : isError || !product ? (
        <p className="mt-6 text-sm text-danger">Could not load that product.</p>
      ) : (
        <>
          <h2 className="mb-8 mt-3 text-heading">Edit {product.name}</h2>
          <ProductForm product={product} />
        </>
      )}
    </div>
  );
}

'use client';

import { formatPrice } from '@oneset/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminProductsApi, catalogApi } from '@/lib/api';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', search],
    queryFn: () => catalogApi.products({ q: search || undefined, pageSize: 50 }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminProductsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          className="max-w-xs"
        />
        <Link href="/admin/products/new" className="inline-flex">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add product
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-panel border border-hairline bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-micro text-muted">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal" />
              </tr>
            </thead>
            <tbody className="hairline-x">
              {data?.items.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.slug}/edit`} className="hover:underline">
                      {product.name}
                    </Link>
                    <p className="text-micro text-muted">{product.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category.name}</td>
                  <td className="px-4 py-3 tabular">{formatPrice(product.priceMillimes)}</td>
                  <td className="px-4 py-3 tabular">
                    <span className={product.stock <= 5 ? 'text-warning' : undefined}>{product.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${product.name}"? This can't be undone.`)) {
                          remove.mutate(product.id);
                        }
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-danger"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.items.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">No products match that search.</p>
          )}
        </div>
      )}
    </div>
  );
}

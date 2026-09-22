'use client';

import type { Product } from '@oneset/types';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { Price } from '@/components/ui/price';
import { ProductMedia } from '@/components/ui/product-media';
import { Rating } from '@/components/ui/rating';
import { buttonStyles } from '@/lib/button-styles';
import { useCompare } from '@/store/compare';

function specValue(product: Product, label: string) {
  return product.specifications.find((spec) => spec.label === label)?.value ?? '—';
}

export default function ComparePage() {
  const items = useCompare((state) => state.items);
  const remove = useCompare((state) => state.remove);

  if (items.length < 2) {
    return (
      <div className="container flex min-h-[60vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">Pick at least two products to compare</h1>
        <p className="mt-3 text-muted">
          Use the scale icon on any product card to add it here up to four at once.
        </p>
        <Link href="/shop" className={buttonStyles({ className: 'mt-8 self-center' })}>
          Browse the shop
        </Link>
      </div>
    );
  }

  // Union of spec labels across every compared product, grouped the same way the product page groups them.
  const groups = new Map<string, string[]>();
  for (const product of items) {
    for (const spec of product.specifications) {
      const labels = groups.get(spec.group) ?? [];
      if (!labels.includes(spec.label)) labels.push(spec.label);
      groups.set(spec.group, labels);
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-title">Compare</h1>
      <p className="mt-2 text-muted">{items.length} products, side by side.</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="w-40" />
              {items.map((product) => (
                <th key={product.id} className="border-b border-hairline px-4 pb-4 text-left align-top font-normal">
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className="mb-2 grid h-6 w-6 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <ProductMedia url={product.images[0]?.url} alt={product.name} className="aspect-square w-28" />
                  <Link href={`/products/${product.slug}`} className="mt-2 block font-medium hover:underline">
                    {product.name}
                  </Link>
                  <p className="text-micro text-muted">{product.brand}</p>
                  <Rating value={product.rating} count={product.reviewCount} className="mt-1" />
                  <Price
                    millimes={product.priceMillimes}
                    compareAt={product.compareAtMillimes}
                    size="sm"
                    className="mt-2"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...groups.entries()].map(([group, labels]) => (
              <Fragment key={group}>
                <tr>
                  <td colSpan={items.length + 1} className="bg-raised px-4 py-2 text-micro font-medium text-ink">
                    {group}
                  </td>
                </tr>
                {labels.map((label) => (
                  <tr key={label}>
                    <td className="border-b border-hairline px-4 py-2.5 text-muted">{label}</td>
                    {items.map((product) => (
                      <td key={product.id} className="border-b border-hairline px-4 py-2.5">
                        {specValue(product, label)}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

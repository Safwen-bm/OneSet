'use client';

import { Scale, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductMedia } from '@/components/ui/product-media';
import { buttonStyles } from '@/lib/button-styles';
import { cn } from '@/lib/utils';
import { COMPARE_LIMIT, useCompare } from '@/store/compare';

export function CompareBar() {
  const items = useCompare((state) => state.items);
  const remove = useCompare((state) => state.remove);
  const clear = useCompare((state) => state.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper/95 backdrop-blur-md">
      <div className="container flex flex-wrap items-center gap-4 py-3">
        <div className="flex items-center gap-2">
          {items.map((product) => (
            <div key={product.id} className="relative">
              <ProductMedia url={product.images[0]?.url} alt={product.name} className="h-12 w-12" />
              <button
                type="button"
                onClick={() => remove(product.id)}
                aria-label={`Remove ${product.name} from comparison`}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-paper"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: COMPARE_LIMIT - items.length }).map((_, index) => (
            <div key={index} className="h-12 w-12 rounded-tile border border-dashed border-hairline" />
          ))}
        </div>

        <p className="text-sm text-muted">
          {items.length} of {COMPARE_LIMIT} selected
        </p>

        <div className="ml-auto flex items-center gap-3">
          <button type="button" onClick={clear} className="text-sm text-muted transition-colors hover:text-ink">
            Clear
          </button>
          {items.length >= 2 ? (
            <Link href="/compare" className={buttonStyles({ size: 'sm' })}>
              <Scale className="h-3.5 w-3.5" />
              Compare
            </Link>
          ) : (
            <span
              className={cn(buttonStyles({ size: 'sm', variant: 'outline' }), 'pointer-events-none opacity-50')}
            >
              Pick one more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

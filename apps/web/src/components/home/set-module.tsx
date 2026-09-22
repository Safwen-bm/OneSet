'use client';

import { formatPrice } from '@oneset/types';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSetups } from '@/hooks/use-catalog';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';

const SLOT_LABELS: Record<string, string> = {
  monitors: 'Display',
  keyboards: 'Board',
  mice: 'Pointer',
  headsets: 'Sound',
  speakers: 'Sound',
  chairs: 'Seat',
  desks: 'Surface',
  microphones: 'Voice',
  webcams: 'Camera',
};

/**
 * The hero's centrepiece: a real setup, read from the API, that can be added in one action.
 * The staggered reveal is the page's single orchestrated motion moment.
 */
export function SetModule() {
  const { data, isLoading } = useSetups();
  const add = useCart((state) => state.add);
  const openCart = useUi((state) => state.openCart);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const setup = data?.find((preset) => preset.slug === 'ranked-ready') ?? data?.[0];

  const addWholeSet = async () => {
    if (!setup) return;
    setAdding(true);
    for (const item of setup.items) {
      await add(item.product, null, 1);
    }
    setAdding(false);
    setAdded(true);
    openCart();
  };

  if (isLoading || !setup) {
    return (
      <div className="h-[420px] rounded-panel border border-hairline bg-surface" aria-hidden="true" />
    );
  }

  return (
    <div className="overflow-hidden rounded-panel border border-hairline bg-surface">
      <div className="flex items-baseline justify-between border-b border-hairline px-5 py-4">
        <div>
          <h2 className="font-display text-heading">{setup.name}</h2>
          <p className="text-micro text-muted">{setup.items.length} pieces, chosen to work together</p>
        </div>
        <Link href="/shop" className="text-micro text-muted transition-colors hover:text-ink">
          Change pieces
        </Link>
      </div>

      <ul className="hairline-x">
        {setup.items.map((item, index) => (
          <li
            key={item.product.id}
            className="motion-safe:animate-slot-in"
            style={{ animationDelay: `${140 + index * 90}ms` }}
          >
            <Link
              href={`/products/${item.product.slug}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-raised"
            >
              <span className="w-16 shrink-0 text-micro text-muted">
                {SLOT_LABELS[item.role] ?? item.product.category.name}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{item.product.name}</span>
              <span className="shrink-0 text-sm text-muted tabular">
                {formatPrice(item.product.priceMillimes)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-raised/60 px-5 py-4">
        <div>
          <p className="text-micro text-muted">Complete set</p>
          <p className="font-display text-xl font-semibold tabular">{formatPrice(setup.totalMillimes)}</p>
        </div>
        <Button variant="accent" onClick={addWholeSet} disabled={adding}>
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : added ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {added ? 'In your cart' : `Add all ${setup.items.length}`}
        </Button>
      </div>
    </div>
  );
}

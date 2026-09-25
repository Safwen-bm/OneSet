'use client';

import { formatPrice } from '@oneset/types';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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
 * Compact bundle widget — works standing alone as a corner card (desktop)
 * or a full-width block (mobile). No layout logic in here; the parent decides size/position.
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
      <div
        className="h-[220px] w-full rounded-lg border border-white/10 bg-black/75 backdrop-blur-md"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/75 shadow-xl shadow-black/40 backdrop-blur-md">
      <div className="h-0.5 w-full bg-accent" />

      <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            Bundle &amp; save
          </p>
          <h2 className="mt-0.5 truncate font-display text-base font-semibold text-white">
            {setup.name}
          </h2>
        </div>
        <Link
          href="/shop"
          className="shrink-0 whitespace-nowrap pt-0.5 text-[11px] text-white/50 transition-colors hover:text-white"
        >
          Change
        </Link>
      </div>

      <ul className="divide-y divide-white/10 border-t border-white/10">
        {setup.items.slice(0, 4).map((item, index) => (
          <li
            key={item.product.id}
            className="motion-safe:animate-slot-in"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Link
              href={`/products/${item.product.slug}`}
              className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-white/5"
            >
              <span className="w-14 shrink-0 text-[11px] text-white/40">
                {SLOT_LABELS[item.role] ?? item.product.category.name}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-white/85">
                {item.product.name}
              </span>
              <span className="shrink-0 text-[13px] text-white/55 tabular">
                {formatPrice(item.product.priceMillimes)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {setup.items.length > 4 ? (
        <p className="px-4 py-1.5 text-[11px] text-white/40">
          +{setup.items.length - 4} more piece{setup.items.length - 4 > 1 ? 's' : ''}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.04] px-4 py-3">
        <div>
          <p className="text-[11px] text-white/50">{setup.items.length}-piece total</p>
          <p className="font-display text-lg font-semibold text-white tabular">
            {formatPrice(setup.totalMillimes)}
          </p>
        </div>
        <button
          type="button"
          onClick={addWholeSet}
          disabled={adding}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : added ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {added ? 'Added' : 'Add all'}
        </button>
      </div>
    </div>
  );
}
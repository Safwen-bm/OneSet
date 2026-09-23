'use client';

import type { Product } from '@oneset/types';
import { Check, Heart, Plus, Scale, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Price } from '@/components/ui/price';
import { ProductMedia } from '@/components/ui/product-media';
import { Rating } from '@/components/ui/rating';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { COMPARE_LIMIT, useCompare } from '@/store/compare';
import { useUi } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const add = useCart((state) => state.add);
  const openCart = useUi((state) => state.openCart);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const saved = useWishlist((state) => state.ids.includes(product.id));
  const toggleCompare = useCompare((state) => state.toggle);
  const compared = useCompare((state) => state.has(product.id));
  const compareCount = useCompare((state) => state.items.length);
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [added]);

  const soldOut = product.stock <= 0;
  const needsChoice = product.variants.length > 1;

  const quickAdd = async () => {
    await add(product, null, 1);
    setAdded(true);
    openCart();
  };

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
          <ProductMedia
            url={product.images[0]?.url}
            alt={product.images[0]?.alt ?? product.name}
            label={product.category.name}
            zoom
            className="aspect-[4/3] w-full"
          />
        </Link>

        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleCompare(product)}
            disabled={!compared && compareCount >= COMPARE_LIMIT}
            aria-pressed={mounted ? compared : false}
            aria-label={compared ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
            className={cn(
              'relative z-10 grid h-9 w-9 place-items-center rounded-full border border-hairline bg-surface/90 backdrop-blur transition-[color,transform] duration-150 ease-set active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
              mounted && compared ? 'text-accent' : 'text-muted hover:text-ink',
            )}
          >
            <Scale className={cn('h-4 w-4 transition-transform duration-200', mounted && compared && 'motion-safe:animate-pop')} />
          </button>
          {soldOut && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-micro text-paper">Sold out</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={mounted ? saved : false}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          className={cn(
            'absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full border border-hairline bg-surface/90 backdrop-blur transition-[color,transform] duration-150 ease-set active:scale-90',
            mounted && saved ? 'text-accent' : 'text-muted hover:text-ink',
          )}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              mounted && saved && 'fill-current motion-safe:animate-pop',
            )}
          />
        </button>

        {soldOut ? null : needsChoice ? (
          <Link
            href={`/products/${product.slug}`}
            className="absolute bottom-2 left-2 right-2 z-10 flex h-10 items-center justify-center gap-2 rounded-full bg-surface text-sm font-medium text-ink opacity-0 shadow-sm transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Choose {product.variants[0]?.optionName.toLowerCase() ?? 'option'}
          </Link>
        ) : (
          <button
            type="button"
            onClick={quickAdd}
            className="absolute bottom-2 left-2 right-2 z-10 flex h-10 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper opacity-0 transition-[opacity,transform] duration-200 ease-set focus-visible:opacity-100 group-hover:opacity-100 active:scale-[0.97] max-md:opacity-100"
          >
            {added ? <Check className="h-4 w-4 motion-safe:animate-pop" /> : <Plus className="h-4 w-4" />}
            {added ? 'Added' : 'Quick add'}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-micro text-muted">{product.brand}</p>
        <h3 className="text-sm font-medium leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            <span className="absolute inset-0" aria-hidden="true" />
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.reviewCount} className="mt-0.5" />
        <Price millimes={product.priceMillimes} compareAt={product.compareAtMillimes} className="mt-1.5" />
        {!soldOut && product.stock <= 5 && (
          <p className="text-micro text-warning">Only {product.stock} left</p>
        )}
      </div>
    </article>
  );
}

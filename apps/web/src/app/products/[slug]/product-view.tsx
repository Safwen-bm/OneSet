'use client';

import type { ProductVariant } from '@oneset/types';
import { Check, ChevronRight, Heart, ShieldCheck, Truck, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/shop/product-card';
import { RecentlyViewedRail } from '@/components/shop/recently-viewed-rail';
import { Reviews } from '@/components/shop/reviews';
import { Button } from '@/components/ui/button';
import { buttonStyles } from '@/lib/button-styles';
import { Price } from '@/components/ui/price';
import { ProductMedia } from '@/components/ui/product-media';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { Rating } from '@/components/ui/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { useProduct, useRelated } from '@/hooks/use-catalog';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useRecentlyViewed } from '@/store/recently-viewed';
import { useUi } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

export function ProductView({ slug }: { slug: string }) {
  const { data: product, isLoading, isError, error } = useProduct(slug);
  const pushRecentlyViewed = useRecentlyViewed((state) => state.push);

  useEffect(() => {
    if (product) pushRecentlyViewed(product);
  }, [product, pushRecentlyViewed]);
  const { data: related } = useRelated(slug);
  const add = useCart((state) => state.add);
  const openCart = useUi((state) => state.openCart);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const saved = useWishlist((state) => (product ? state.ids.includes(product.id) : false));

  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const variant: ProductVariant | null = useMemo(() => {
    if (!product?.variants.length) return null;
    return product.variants.find((v) => v.id === variantId) ?? null;
  }, [product, variantId]);

  const specGroups = useMemo(() => {
    const groups = new Map<string, { label: string; value: string }[]>();
    for (const spec of product?.specifications ?? []) {
      const list = groups.get(spec.group) ?? [];
      list.push({ label: spec.label, value: spec.value });
      groups.set(spec.group, list);
    }
    return [...groups.entries()];
  }, [product]);

  if (isLoading) {
    return (
      <div className="container grid gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container flex min-h-[50vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">We could not find that product</h1>
        <p className="mt-3 text-muted">{(error as Error)?.message ?? 'The link may be out of date.'}</p>
        <Link href="/shop" className={buttonStyles({ className: 'mt-8 self-center' })}>
          Browse the shop
        </Link>
      </div>
    );
  }

  const price = variant?.priceMillimes ?? product.priceMillimes;
  const stock = variant?.stock ?? product.stock;
  const soldOut = stock <= 0;
  const needsVariant = product.variants.length > 1 && !variant;

  const onAdd = async () => {
    await add(product, variant, quantity);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="container py-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-micro text-muted">
        <Link href="/shop" className="transition-colors hover:text-ink">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/categories/${product.category.slug}`} className="transition-colors hover:text-ink">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <ProductMedia
            url={product.images[activeImage]?.url}
            alt={product.images[activeImage]?.alt ?? product.name}
            className="aspect-square w-full"
          />
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === activeImage}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-tile ring-offset-2 ring-offset-paper transition-shadow',
                    index === activeImage && 'ring-2 ring-ink',
                  )}
                >
                  <ProductMedia url={image.url} alt={image.alt} className="h-full w-full rounded-none border-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted">{product.brand}</p>
          <h1 className="mt-1 text-title">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} count={product.reviewCount} />
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-hairline px-2.5 py-1 text-micro text-muted">
                {tag}
              </span>
            ))}
          </div>

          <Price
            millimes={price}
            compareAt={product.compareAtMillimes}
            size="lg"
            className="mt-6"
          />

          <p className="mt-4 max-w-[52ch] text-muted">{product.shortDescription}</p>

          {product.variants.length > 0 && (
            <fieldset className="mt-8">
              <legend className="mb-2 text-sm text-muted">
                {product.variants[0].optionName}
                {needsVariant && <span className="ml-2 text-ink">Pick one</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((option) => {
                  const active = option.id === variantId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setVariantId(option.id);
                        setQuantity(1);
                      }}
                      disabled={option.stock <= 0}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors',
                        active ? 'border-ink text-ink' : 'border-hairline text-muted hover:border-ink/40',
                        option.stock <= 0 && 'cursor-not-allowed opacity-40 line-through',
                      )}
                    >
                      {option.swatchHex && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-hairline"
                          style={{ backgroundColor: option.swatchHex }}
                          aria-hidden="true"
                        />
                      )}
                      {option.optionValue}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} max={stock} onChange={setQuantity} />
            <Button size="lg" onClick={onAdd} disabled={soldOut || needsVariant} className="min-w-[13rem] flex-1">
              {added ? <Check className="h-4 w-4" /> : null}
              {soldOut ? 'Sold out' : needsVariant ? 'Pick an option first' : added ? 'Added to cart' : 'Add to cart'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleWishlist(product)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={cn('h-12 w-12', saved && 'text-accent')}
            >
              <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
            </Button>
          </div>

          <p className="mt-3 text-micro text-muted">
            {soldOut
              ? 'Out of stock ? Tell us and we will hold the next unit.'
              : stock <= 5
                ? `Only ${stock} left in Tunis.`
                : 'In stock in Tunis, ships today.'}
          </p>

          <ul className="mt-8 grid gap-3 border-t border-hairline pt-6 text-sm text-muted sm:grid-cols-3">
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0" /> 24 h delivery
            </li>
            <li className="flex items-start gap-2">
              <Undo2 className="mt-0.5 h-4 w-4 shrink-0" /> 14-day returns
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> 2-year warranty
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <section>
          <h2 className="text-heading">About this product</h2>
          {product.description.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mt-3 max-w-[68ch] text-muted">
              {paragraph}
            </p>
          ))}
        </section>

        <section>
          <h2 className="text-heading">Specifications</h2>
          <div className="mt-3">
            {specGroups.map(([group, specs]) => (
              <div key={group} className="border-t border-hairline py-4 first:border-t-0">
                <h3 className="mb-2 text-micro text-muted">{group}</h3>
                <dl className="space-y-1.5">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-6 text-sm">
                      <dt className="text-muted">{spec.label}</dt>
                      <dd className="text-right">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Reviews slug={slug} />

      {related && related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-title">Perfect with this</h2>
          <p className="mt-2 text-muted">Pieces from the rest of the desk that pair with it.</p>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewedRail excludeId={product.id} />
    </div>
  );
}

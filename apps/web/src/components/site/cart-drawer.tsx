'use client';

import { formatPrice, lineKey } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { CompatibilityResults } from '@/components/shop/compatibility-results';
import { buttonStyles } from '@/lib/button-styles';
import { ProductMedia } from '@/components/ui/product-media';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { compatibilityApi } from '@/lib/api';
import { useCart, type StoredLine } from '@/store/cart';
import { useUi } from '@/store/ui';

/** Categories the compatibility engine actually has rules for — see CompatibilityRule seed. */
const RULE_PAIRS: [string, string][] = [
  ['processors', 'memory'],
  ['graphics-cards', 'processors'],
];

/** Only runs the check when the cart actually mixes categories a rule cares about. */
function useCartCompatibilityIds(lines: StoredLine[]) {
  return useMemo(() => {
    const categories = new Set(lines.map((line) => line.categorySlug));
    const relevant = RULE_PAIRS.some(([a, b]) => categories.has(a) && categories.has(b));
    if (!relevant) return null;
    return [...new Set(lines.map((line) => line.productId))];
  }, [lines]);
}

export function CartDrawer() {
  const open = useUi((state) => state.cartOpen);
  const close = useUi((state) => state.closeCart);
  const lines = useCart((state) => state.lines);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const totals = useCart((state) => state.totals)();
  const panelRef = useRef<HTMLDivElement>(null);

  const compatibilityIds = useCartCompatibilityIds(lines);
  const { data: compatibility } = useQuery({
    queryKey: ['cart-compatibility', compatibilityIds],
    queryFn: () => compatibilityApi.check(compatibilityIds!),
    enabled: Boolean(compatibilityIds && compatibilityIds.length >= 2),
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  if (!open) return null;

  const progress = Math.round(totals.freeDeliveryProgress * 100);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your cart">
      <button
        type="button"
        onClick={close}
        aria-label="Close cart"
        className="absolute inset-0 bg-ink/30 motion-safe:animate-fade-in"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-hairline bg-paper shadow-2xl outline-none motion-safe:animate-drawer-in"
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="font-display text-heading">
            Your cart
            {totals.itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted tabular">
                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-muted" strokeWidth={1.25} />
            <p className="text-sm text-muted">
              Nothing here yet. Pick a piece and the rest of the setup follows.
            </p>
            <Link href="/shop" onClick={close} className={buttonStyles({ variant: 'outline' })}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-hairline px-5 py-4">
              {totals.hasFreeDelivery ? (
                <p className="text-sm text-positive">Delivery is on us.</p>
              ) : (
                <p className="text-sm text-muted">
                  Add{' '}
                  <span className="font-medium text-ink tabular">
                    {formatPrice(totals.amountToFreeDelivery)}
                  </span>{' '}
                  more for free delivery
                </p>
              )}
              <div
                className="mt-2 h-1 w-full overflow-hidden rounded-full bg-raised"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress to free delivery"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-set"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {compatibility && (
              <div className="px-5 pt-4">
                <CompatibilityResults report={compatibility} compact />
              </div>
            )}

            <ul className="hairline-x flex-1 overflow-y-auto px-5">
              {lines.map((line) => {
                const key = lineKey(line.productId, line.variantId);
                return (
                  <li key={key} className="flex gap-4 py-4">
                    <Link href={`/products/${line.slug}`} onClick={close} className="shrink-0">
                      <ProductMedia url={line.image} alt={line.name} className="h-20 w-20" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-micro text-muted">{line.brand}</p>
                          <Link
                            href={`/products/${line.slug}`}
                            onClick={close}
                            className="line-clamp-2 text-sm font-medium text-ink hover:underline"
                          >
                            {line.name}
                          </Link>
                          {line.optionLabel && (
                            <p className="mt-0.5 text-micro text-muted">{line.optionLabel}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-danger"
                          aria-label={`Remove ${line.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <QuantityStepper
                          value={line.quantity}
                          max={line.stock}
                          onChange={(next) => setQuantity(key, next)}
                        />
                        <span className="text-sm font-medium tabular">
                          {formatPrice(line.unitPriceMillimes * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-hairline px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular">{formatPrice(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="tabular">
                    {totals.delivery === 0 ? 'Free' : formatPrice(totals.delivery)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-hairline pt-2 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular">{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={close}
                className={buttonStyles({ size: 'lg', className: 'mt-4 w-full' })}
              >
                Go to checkout
              </Link>
              <p className="mt-2 text-center text-micro text-muted">
                Taxes included. Delivery calculated at checkout.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

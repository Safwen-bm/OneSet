'use client';

import { calculateTotals, clampQuantity, lineKey, type CartLine, type CartTotals } from '@oneset/types';
import type { Product, ProductVariant } from '@oneset/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi, type ServerCart } from '@/lib/api';
import { useAuth } from './auth';

export interface StoredLine extends CartLine {
  /** Present only for lines that exist server-side. */
  serverItemId?: string;
}

interface CartState {
  lines: StoredLine[];
  syncing: boolean;
  lastAdded: string | null;
  totals: () => CartTotals;
  add: (product: Product, variant?: ProductVariant | null, quantity?: number) => Promise<void>;
  setQuantity: (key: string, quantity: number) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  hydrateFromServer: () => Promise<void>;
  mergeAfterLogin: () => Promise<void>;
}

const toLine = (product: Product, variant: ProductVariant | null | undefined, quantity: number): StoredLine => ({
  productId: product.id,
  variantId: variant?.id ?? null,
  slug: product.slug,
  name: product.name,
  brand: product.brand,
  optionLabel: variant ? `${variant.optionName}: ${variant.optionValue}` : null,
  unitPriceMillimes: variant?.priceMillimes ?? product.priceMillimes,
  compareAtMillimes: product.compareAtMillimes ?? null,
  quantity,
  stock: variant?.stock ?? product.stock,
  image: product.images[0]?.url ?? null,
  categorySlug: product.category.slug,
});

const fromServer = (cart: ServerCart): StoredLine[] =>
  cart.lines.map((line) => ({ ...line, serverItemId: line.id }));

const isLoggedIn = () => Boolean(useAuth.getState().accessToken);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      syncing: false,
      lastAdded: null,

      totals: () => calculateTotals(get().lines),

      add: async (product, variant, quantity = 1) => {
        const key = lineKey(product.id, variant?.id ?? null);
        const existing = get().lines.find((line) => lineKey(line.productId, line.variantId) === key);
        const stock = variant?.stock ?? product.stock;
        const next = clampQuantity((existing?.quantity ?? 0) + quantity, stock);

        if (next === 0) return;

        // Optimistic: the drawer should open on the same frame as the click.
        set({
          lastAdded: key,
          lines: existing
            ? get().lines.map((line) =>
                lineKey(line.productId, line.variantId) === key ? { ...line, quantity: next } : line,
              )
            : [...get().lines, toLine(product, variant, next)],
        });

        if (!isLoggedIn()) return;
        set({ syncing: true });
        try {
          const cart = await cartApi.add({ productId: product.id, variantId: variant?.id, quantity });
          set({ lines: fromServer(cart) });
        } catch {
          // Keep the optimistic line; the next hydrate reconciles it.
        } finally {
          set({ syncing: false });
        }
      },

      setQuantity: async (key, quantity) => {
        const line = get().lines.find((l) => lineKey(l.productId, l.variantId) === key);
        if (!line) return;

        if (quantity <= 0) return get().remove(key);
        const next = clampQuantity(quantity, line.stock);

        set({
          lines: get().lines.map((l) =>
            lineKey(l.productId, l.variantId) === key ? { ...l, quantity: next } : l,
          ),
        });

        if (!isLoggedIn() || !line.serverItemId) return;
        set({ syncing: true });
        try {
          const cart = await cartApi.update(line.serverItemId, next);
          set({ lines: fromServer(cart) });
        } catch {
          /* optimistic state stands */
        } finally {
          set({ syncing: false });
        }
      },

      remove: async (key) => {
        const line = get().lines.find((l) => lineKey(l.productId, l.variantId) === key);
        set({ lines: get().lines.filter((l) => lineKey(l.productId, l.variantId) !== key) });

        if (!isLoggedIn() || !line?.serverItemId) return;
        try {
          const cart = await cartApi.remove(line.serverItemId);
          set({ lines: fromServer(cart) });
        } catch {
          /* optimistic state stands */
        }
      },

      clear: async () => {
        set({ lines: [] });
        if (!isLoggedIn()) return;
        try {
          await cartApi.clear();
        } catch {
          /* nothing to reconcile — the local cart is already empty */
        }
      },

      hydrateFromServer: async () => {
        if (!isLoggedIn()) return;
        set({ syncing: true });
        try {
          const cart = await cartApi.get();
          set({ lines: fromServer(cart) });
        } catch {
          /* offline: keep what is in localStorage */
        } finally {
          set({ syncing: false });
        }
      },

      mergeAfterLogin: async () => {
        const guestLines = get().lines.filter((line) => !line.serverItemId);
        set({ syncing: true });
        try {
          const cart = guestLines.length
            ? await cartApi.merge(
                guestLines.map((line) => ({
                  productId: line.productId,
                  variantId: line.variantId,
                  quantity: line.quantity,
                })),
              )
            : await cartApi.get();
          set({ lines: fromServer(cart) });
        } catch {
          /* offline: the guest cart stays local until the next sync */
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: 'oneset-cart',
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export const useCartCount = () =>
  useCart((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0));

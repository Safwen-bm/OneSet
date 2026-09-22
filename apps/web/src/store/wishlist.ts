'use client';

import type { Product } from '@oneset/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from '@/lib/api';
import { useAuth } from './auth';

interface WishlistState {
  /** Product ids — enough for the heart state on cards. */
  ids: string[];
  products: Product[];
  has: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  hydrateFromServer: () => Promise<void>;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      products: [],

      has: (productId) => get().ids.includes(productId),

      toggle: async (product) => {
        const on = get().ids.includes(product.id);
        set({
          ids: on ? get().ids.filter((id) => id !== product.id) : [...get().ids, product.id],
          products: on
            ? get().products.filter((p) => p.id !== product.id)
            : [product, ...get().products],
        });

        if (!useAuth.getState().accessToken) return;
        try {
          const products = await wishlistApi.toggle(product.id);
          set({ products, ids: products.map((p) => p.id) });
        } catch {
          /* optimistic state stands */
        }
      },

      hydrateFromServer: async () => {
        if (!useAuth.getState().accessToken) return;
        try {
          const products = await wishlistApi.list();
          set({ products, ids: products.map((p) => p.id) });
        } catch {
          /* offline: keep the local list */
        }
      },
    }),
    { name: 'oneset-wishlist' },
  ),
);

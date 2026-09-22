'use client';

import type { Product } from '@oneset/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENTLY_VIEWED = 12;

interface RecentlyViewedState {
  items: Product[];
  push: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      push: (product) => {
        const withoutThis = get().items.filter((item) => item.id !== product.id);
        set({ items: [product, ...withoutThis].slice(0, MAX_RECENTLY_VIEWED) });
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'oneset-recently-viewed' },
  ),
);

'use client';

import type { Product } from '@oneset/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const COMPARE_LIMIT = 4;

interface CompareState {
  items: Product[];
  has: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      has: (id) => get().items.some((product) => product.id === id),

      toggle: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set({ items: get().items.filter((item) => item.id !== product.id) });
        } else if (get().items.length < COMPARE_LIMIT) {
          set({ items: [...get().items, product] });
        }
      },

      remove: (id) => set({ items: get().items.filter((item) => item.id !== id) }),

      clear: () => set({ items: [] }),
    }),
    { name: 'oneset-compare' },
  ),
);

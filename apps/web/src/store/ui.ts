'use client';

import { create } from 'zustand';

interface UiState {
  cartOpen: boolean;
  filtersOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleFilters: () => void;
  setFilters: (open: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  cartOpen: false,
  filtersOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
  setFilters: (open) => set({ filtersOpen: open }),
}));

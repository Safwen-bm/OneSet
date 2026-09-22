'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';

/** Pulls the server cart and wishlist once a session exists. */
export function SessionSync() {
  const token = useAuth((state) => state.accessToken);
  const hydrateCart = useCart((state) => state.hydrateFromServer);
  const hydrateWishlist = useWishlist((state) => state.hydrateFromServer);

  useEffect(() => {
    if (!token) return;
    void hydrateCart();
    void hydrateWishlist();
  }, [token, hydrateCart, hydrateWishlist]);

  return null;
}

'use client';

import Link from 'next/link';
import { ProductGrid } from '@/components/shop/product-grid';
import { buttonStyles } from '@/lib/button-styles';
import { useWishlist } from '@/store/wishlist';

export default function WishlistPage() {
  const products = useWishlist((state) => state.products);

  return (
    <div className="container py-16">
      <h1 className="text-title">Saved for later</h1>
      <p className="mt-2 text-muted">
        {products.length
          ? 'Yours on this device, and on every device once you log in.'
          : 'Nothing saved yet.'}
      </p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-panel border border-hairline bg-surface p-12 text-center">
          <p className="text-sm text-muted">
            Tap the heart on any product to keep it here while you decide.
          </p>
          <Link href="/shop" className={buttonStyles({ className: 'mt-6' })}>
            Browse the shop
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} className="mt-10" />
      )}
    </div>
  );
}

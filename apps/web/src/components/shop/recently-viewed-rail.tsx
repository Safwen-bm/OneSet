'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/shop/product-grid';
import { useRecentlyViewed } from '@/store/recently-viewed';

export function RecentlyViewedRail({
  excludeId,
  title = 'Welcome back pick up where you left off',
}: {
  excludeId?: string;
  title?: string;
}) {
  const items = useRecentlyViewed((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const visible = items.filter((item) => item.id !== excludeId).slice(0, 4);

  if (!mounted || visible.length === 0) return null;

  return (
    <section className="mt-16 border-t border-hairline bg-surface pb-16 pt-10">
      <div className="container">
        <div className="flex items-end justify-between border-b border-hairline pb-5">
          <div>
            <span className="font-mono text-micro uppercase tracking-[0.18em] text-accent">
              Recently viewed
            </span>

            <h2 className="mt-2 text-title">{title}</h2>
          </div>

          <span className="hidden font-mono text-micro text-muted sm:block">
            {String(visible.length).padStart(2, '0')} ITEMS
          </span>
        </div>

        <ProductGrid
          products={visible}
          className="mt-6 lg:grid-cols-4"
        />
      </div>
    </section>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/shop/product-grid';
import { useRecentlyViewed } from '@/store/recently-viewed';

export function RecentlyViewedRail({ excludeId, title = 'Recently viewed' }: { excludeId?: string; title?: string }) {
  const items = useRecentlyViewed((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const visible = items.filter((item) => item.id !== excludeId).slice(0, 4);
  if (!mounted || visible.length === 0) return null;

  return (
    <section className="mt-16 border-t border-hairline pt-10">
      <h2 className="text-heading">{title}</h2>
      <ProductGrid products={visible} className="mt-6 lg:grid-cols-4" />
    </section>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogBrowser } from '@/components/shop/catalog-browser';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Every product OneSet carries, filterable by category, brand, price and features.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-sm text-muted">Loading the catalog…</div>}>
      <CatalogBrowser
        title="Everything we carry"
        description="Fifteen categories, one delivery, one warranty desk."
      />
    </Suspense>
  );
}

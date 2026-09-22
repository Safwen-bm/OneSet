import { Suspense } from 'react';
import { CategoryView } from './category-view';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="container py-20 text-sm text-muted">Loading…</div>}>
      <CategoryView slug={params.slug} />
    </Suspense>
  );
}

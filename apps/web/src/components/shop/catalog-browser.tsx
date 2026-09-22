'use client';

import type { ProductQuery } from '@oneset/types';
import { SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCategories, useFacets, useProducts } from '@/hooks/use-catalog';
import { countActiveFilters, parseQuery, serializeQuery } from '@/lib/query';
import { cn } from '@/lib/utils';
import { useUi } from '@/store/ui';
import { Filters, type FilterPatch } from './filters';
import { ProductGrid } from './product-grid';

const SORTS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
  { value: 'popular', label: 'Most reviewed' },
];

export function CatalogBrowser({
  lockedCategory,
  title,
  description,
}: {
  lockedCategory?: string;
  title: string;
  description?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filtersOpen = useUi((state) => state.filtersOpen);
  const setFilters = useUi((state) => state.setFilters);

  const query = useMemo(() => {
    const parsed = parseQuery(new URLSearchParams(searchParams.toString()));
    return lockedCategory ? { ...parsed, category: lockedCategory } : parsed;
  }, [searchParams, lockedCategory]);

  const { data, isLoading, isError, error } = useProducts(query);
  const { data: facets } = useFacets({ ...query, brands: undefined, tags: undefined });
  const { data: categories } = useCategories();

  const push = useCallback(
    (next: ProductQuery & { featured?: boolean }) => {
      const qs = serializeQuery(lockedCategory ? { ...next, category: undefined } : next);
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, lockedCategory],
  );

  const patch = (changes: FilterPatch) => push({ ...query, ...changes, page: 1 });

  const activeCount = countActiveFilters(lockedCategory ? { ...query, category: undefined } : query);

  const chips = [
    ...(query.brands ?? []).map((brand) => ({
      label: brand,
      clear: () => patch({ brands: query.brands!.filter((b) => b !== brand) }),
    })),
    ...(query.tags ?? []).map((tag) => ({
      label: tag,
      clear: () => patch({ tags: query.tags!.filter((t) => t !== tag) }),
    })),
    ...(query.inStock ? [{ label: 'In stock', clear: () => patch({ inStock: undefined }) }] : []),
    ...(query.onSale ? [{ label: 'On sale', clear: () => patch({ onSale: undefined }) }] : []),
    ...(query.minRating
      ? [{ label: `${query.minRating}+ rating`, clear: () => patch({ minRating: undefined }) }]
      : []),
  ];

  return (
    <div className="container py-10">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-title">{title}</h1>
        {description ? <p className="mt-2 text-muted">{description}</p> : null}
        {query.q ? (
          <p className="mt-2 text-sm text-muted">
            Results for <span className="text-ink">“{query.q}”</span>
          </p>
        ) : null}
      </header>

      <div className="grid gap-10 lg:grid-cols-[236px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Filters
              query={query}
              facets={facets}
              categories={lockedCategory ? undefined : categories}
              onChange={patch}
              onClear={() => push({ q: query.q, page: 1 })}
            />
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-hairline pb-4">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setFilters(true)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && <span className="tabular">({activeCount})</span>}
            </Button>

            <p className="text-sm text-muted tabular">
              {isLoading ? 'Loading…' : `${data?.total ?? 0} products`}
            </p>

            <label className="ml-auto flex items-center gap-2 text-sm text-muted">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={query.sort ?? 'newest'}
                onChange={(event) => patch({ sort: event.target.value as ProductQuery['sort'] })}
                className="h-9 rounded-full border border-hairline bg-surface px-3 text-sm text-ink focus:outline-none"
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2 motion-safe:animate-fade-in">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.clear}
                  className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-micro text-ink transition-[border-color,transform] duration-150 ease-set hover:border-ink/40 active:scale-[0.94]"
                >
                  {chip.label}
                  <X className="h-3 w-3 text-muted" />
                </button>
              ))}
            </div>
          )}

          {isError ? (
            <div className="rounded-panel border border-hairline bg-surface p-10 text-center">
              <p className="text-sm text-ink">The catalog did not load.</p>
              <p className="mt-1 text-sm text-muted">
                {(error as Error)?.message ?? 'Check that the API is running, then try again.'}
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => router.refresh()}>
                Try again
              </Button>
            </div>
          ) : !isLoading && data?.items.length === 0 ? (
            <div className="rounded-panel border border-hairline bg-surface p-10 text-center">
              <p className="text-sm text-ink">Nothing matches those filters.</p>
              <p className="mt-1 text-sm text-muted">Widen the price range or clear a filter to see more.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => push({ q: query.q })}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <ProductGrid products={data?.items} loading={isLoading} className="lg:grid-cols-3" />
          )}

          {data && data.pageCount > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
              {Array.from({ length: data.pageCount }).map((_, index) => {
                const page = index + 1;
                const active = page === data.page;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => push({ ...query, page })}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'h-9 min-w-9 rounded-full px-3 text-sm tabular transition-colors',
                      active ? 'bg-ink text-paper' : 'text-muted hover:bg-raised hover:text-ink',
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </nav>
          )}
        </section>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            onClick={() => setFilters(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm overflow-y-auto border-r border-hairline bg-paper p-5 motion-safe:animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-heading">Filters</h2>
              <button
                type="button"
                onClick={() => setFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Filters
              query={query}
              facets={facets}
              categories={lockedCategory ? undefined : categories}
              onChange={patch}
              onClear={() => push({ q: query.q, page: 1 })}
            />
            <Button className="mt-6 w-full" onClick={() => setFilters(false)}>
              Show {data?.total ?? 0} products
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

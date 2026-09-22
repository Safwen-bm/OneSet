'use client';

import { formatPrice, type CatalogFacets, type Category, type ProductQuery } from '@oneset/types';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterPatch extends Partial<ProductQuery> {}

const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: 'Under 200 TND', max: 200_000 },
  { label: '200 – 600', min: 200_000, max: 600_000 },
  { label: '600 – 1,500', min: 600_000, max: 1_500_000 },
  { label: 'Over 1,500', min: 1_500_000 },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-medium text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  children,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted transition-colors hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded-[4px] border-hairline text-accent accent-[hsl(var(--accent))]"
      />
      <span className={cn('flex-1', checked && 'text-ink')}>{children}</span>
      {count !== undefined && <span className="text-micro text-muted tabular">{count}</span>}
    </label>
  );
}

export function Filters({
  query,
  facets,
  categories,
  onChange,
  onClear,
}: {
  query: ProductQuery;
  facets?: CatalogFacets;
  categories?: Category[];
  onChange: (patch: FilterPatch) => void;
  onClear: () => void;
}) {
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');

  const toggleInArray = (key: 'brands' | 'tags', value: string) => {
    const current = query[key] ?? [];
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
    onChange({ [key]: next.length ? next : undefined } as FilterPatch);
  };

  return (
    <div className="space-y-0">
      <Group title="Category">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onChange({ category: undefined })}
            className={cn(
              'py-1 text-left text-sm text-muted transition-colors hover:text-ink',
              !query.category && 'text-ink',
            )}
          >
            Everything
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange({ category: category.slug })}
              className={cn(
                'flex items-center justify-between py-1 text-left text-sm text-muted transition-colors hover:text-ink',
                query.category === category.slug && 'text-ink',
              )}
            >
              <span>{category.name}</span>
              {category.productCount !== undefined && (
                <span className="text-micro tabular">{category.productCount}</span>
              )}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Price">
        <div className="flex flex-col gap-1">
          {PRICE_BANDS.map((band) => {
            const active = query.minPrice === band.min && query.maxPrice === band.max;
            return (
              <button
                key={band.label}
                type="button"
                onClick={() =>
                  onChange(
                    active
                      ? { minPrice: undefined, maxPrice: undefined }
                      : { minPrice: band.min, maxPrice: band.max },
                  )
                }
                className={cn(
                  'py-1 text-left text-sm text-muted transition-colors hover:text-ink',
                  active && 'text-ink',
                )}
              >
                {band.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            inputMode="numeric"
            value={customMin}
            onChange={(event) => setCustomMin(event.target.value)}
            placeholder="Min"
            aria-label="Minimum price in dinar"
            className="h-9 w-full rounded-full border border-hairline bg-surface px-3 text-sm tabular"
          />
          <span className="text-muted">–</span>
          <input
            inputMode="numeric"
            value={customMax}
            onChange={(event) => setCustomMax(event.target.value)}
            placeholder="Max"
            aria-label="Maximum price in dinar"
            className="h-9 w-full rounded-full border border-hairline bg-surface px-3 text-sm tabular"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                minPrice: customMin ? Number(customMin) * 1000 : undefined,
                maxPrice: customMax ? Number(customMax) * 1000 : undefined,
              })
            }
          >
            Set
          </Button>
        </div>
        {facets && facets.priceRange.max > 0 && (
          <p className="mt-2 text-micro text-muted">
            In stock here: {formatPrice(facets.priceRange.min)} – {formatPrice(facets.priceRange.max)}
          </p>
        )}
      </Group>

      {facets?.brands.length ? (
        <Group title="Brand">
          <div className="max-h-56 overflow-y-auto pr-1">
            {facets.brands.map((brand) => (
              <Toggle
                key={brand.value}
                count={brand.count}
                checked={(query.brands ?? []).includes(brand.value)}
                onChange={() => toggleInArray('brands', brand.value)}
              >
                {brand.value}
              </Toggle>
            ))}
          </div>
        </Group>
      ) : null}

      {facets?.tags.length ? (
        <Group title="Features">
          <div className="flex flex-wrap gap-1.5">
            {facets.tags.map((tag) => {
              const active = (query.tags ?? []).includes(tag.value);
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleInArray('tags', tag.value)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-micro transition-[color,border-color,background-color,transform] duration-150 ease-set active:scale-[0.94]',
                    active
                      ? 'border-ink bg-ink text-paper'
                      : 'border-hairline text-muted hover:border-ink/40 hover:text-ink',
                  )}
                >
                  {tag.value}
                </button>
              );
            })}
          </div>
        </Group>
      ) : null}

      <Group title="Rating">
        <div className="flex flex-col">
          {[4.5, 4, 3].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                onChange({ minRating: query.minRating === rating ? undefined : rating })
              }
              className={cn(
                'py-1 text-left text-sm text-muted transition-colors hover:text-ink',
                query.minRating === rating && 'text-ink',
              )}
            >
              {rating} and up
            </button>
          ))}
        </div>
      </Group>

      <Group title="Availability">
        <Toggle checked={Boolean(query.inStock)} onChange={() => onChange({ inStock: !query.inStock })}>
          In stock only
        </Toggle>
        <Toggle checked={Boolean(query.onSale)} onChange={() => onChange({ onSale: !query.onSale })}>
          On sale
        </Toggle>
      </Group>

      <div className="border-t border-hairline pt-5">
        <Button variant="ghost" size="sm" onClick={onClear} className="w-full">
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </Button>
      </div>
    </div>
  );
}

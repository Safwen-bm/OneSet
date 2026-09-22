'use client';

import { formatPrice } from '@oneset/types';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CompatibilityResults } from '@/components/shop/compatibility-results';
import { Button } from '@/components/ui/button';
import { API_URL, catalogApi, compatibilityApi } from '@/lib/api';

const SLOTS = [
  { label: 'Processor', categorySlug: 'processors' },
  { label: 'Memory', categorySlug: 'memory' },
  { label: 'Graphics card', categorySlug: 'graphics-cards' },
] as const;

export default function CompatibilityPage() {
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [checkedIds, setCheckedIds] = useState<string[] | null>(null);

  const productQueries = useQueries({
    queries: SLOTS.map((slot) => ({
      queryKey: ['compat-options', slot.categorySlug],
      queryFn: () => catalogApi.products({ category: slot.categorySlug, inStock: true, pageSize: 50 }),
    })),
  });

  const { data: rules } = useQuery({ queryKey: ['compatibility-rules'], queryFn: () => compatibilityApi.rules() });

  const selectedIds = useMemo(() => Object.values(selection).filter(Boolean), [selection]);

  const { data: report, isFetching } = useQuery({
    queryKey: ['compatibility-check', checkedIds],
    queryFn: () => compatibilityApi.check(checkedIds!),
    enabled: Boolean(checkedIds && checkedIds.length >= 2),
  });

  if (!API_URL) {
    return (
      <div className="container flex min-h-[60vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">The compatibility checker needs the API connected</h1>
        <p className="mt-3 text-muted">
          You&apos;re browsing the sample catalog. Start the API with{' '}
          <code className="rounded bg-surface px-1.5 py-0.5">npm run dev:api</code> to run a real check.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <p className="text-micro text-muted">Compatibility checker</p>
        </div>
        <h1 className="mt-1 text-title">Make sure the parts actually work together</h1>
        <p className="mt-2 text-muted">
          Pick at least two parts. Every check runs against real rules stored in the database nothing
          here is a hardcoded if/else for a specific product.
        </p>
      </div>

      <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
        {SLOTS.map((slot, index) => {
          const query = productQueries[index];
          return (
            <label key={slot.categorySlug} className="block">
              <span className="mb-1.5 block text-sm text-muted">{slot.label}</span>
              <select
                value={selection[slot.categorySlug] ?? ''}
                onChange={(event) =>
                  setSelection((current) => ({ ...current, [slot.categorySlug]: event.target.value }))
                }
                className="h-11 w-full rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus:outline-none"
              >
                <option value="">None selected</option>
                {query.data?.items.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatPrice(product.priceMillimes)}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      <Button
        size="lg"
        className="mt-6"
        disabled={selectedIds.length < 2 || isFetching}
        onClick={() => setCheckedIds(selectedIds)}
      >
        {isFetching ? 'Checking…' : 'Check compatibility'}
      </Button>
      {selectedIds.length < 2 && (
        <p className="mt-2 text-micro text-muted">Pick at least two parts to run a check.</p>
      )}

      {report && (
        <div className="mt-8 max-w-2xl">
          <CompatibilityResults report={report} />
        </div>
      )}

      {rules && rules.length > 0 && (
        <details className="mt-10 max-w-2xl text-sm text-muted">
          <summary className="cursor-pointer text-ink">
            {rules.length} active rule{rules.length > 1 ? 's' : ''} see what&apos;s checked
          </summary>
          <ul className="mt-3 space-y-2">
            {rules.map((rule) => (
              <li key={rule.id} className="rounded-tile border border-hairline bg-surface p-3">
                <p className="text-ink">{rule.name}</p>
                <p className="mt-1 text-micro">{rule.message}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

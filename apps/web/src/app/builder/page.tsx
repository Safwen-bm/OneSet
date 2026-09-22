'use client';

import { formatPrice, toMillimes, type Product } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductMedia } from '@/components/ui/product-media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL, builderApi, catalogApi, type BuilderRole, type BuilderResult, type BuilderStyle } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useUi } from '@/store/ui';

const STYLES: { value: BuilderStyle; label: string; blurb: string }[] = [
  {
    value: 'PERFORMANCE',
    label: 'Performance',
    blurb: 'More budget on the display, mouse and board the reaction-time pieces.',
  },
  {
    value: 'BALANCED',
    label: 'Balanced',
    blurb: 'An even spread across every piece of the desk.',
  },
  {
    value: 'AESTHETIC',
    label: 'Aesthetic',
    blurb: 'More on the desk, chair and display the pieces people actually see.',
  },
];

function SwapPicker({
  categorySlug,
  currentProductId,
  onPick,
  onClose,
}: {
  categorySlug: string;
  currentProductId: string;
  onPick: (product: Product) => void;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['builder-alternatives', categorySlug],
    queryFn: () => catalogApi.products({ category: categorySlug, inStock: true, pageSize: 50, sort: 'price-asc' }),
  });

  return (
    <div className="mt-3 rounded-tile border border-hairline bg-raised/40 p-3">
      {isLoading ? (
        <p className="p-2 text-sm text-muted">Loading options…</p>
      ) : (
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {data?.items.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onPick(product);
                onClose();
              }}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-tile px-3 py-2 text-left text-sm transition-colors hover:bg-surface',
                product.id === currentProductId && 'bg-surface',
              )}
            >
              <span className="min-w-0 truncate">{product.name}</span>
              <span className="flex shrink-0 items-center gap-2 tabular text-muted">
                {formatPrice(product.priceMillimes)}
                {product.id === currentProductId && <Check className="h-3.5 w-3.5 text-ink" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role,
  onSwap,
}: {
  role: BuilderRole;
  onSwap: (product: Product) => void;
}) {
  const [swapping, setSwapping] = useState(false);
  const { product } = role;

  return (
    <div className="rounded-panel border border-hairline bg-surface p-4">
      <div className="flex gap-4">
        <ProductMedia url={product.images[0]?.url} alt={product.name} className="h-20 w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-micro text-muted">{role.role}</p>
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="mt-0.5 text-micro text-muted">{product.brand}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm tabular">{formatPrice(product.priceMillimes)}</span>
            <button
              type="button"
              onClick={() => setSwapping((s) => !s)}
              aria-expanded={swapping}
              className="flex items-center gap-1 text-micro text-muted transition-colors hover:text-ink"
            >
              Swap
              <ChevronDown className={cn('h-3 w-3 transition-transform', swapping && 'rotate-180')} />
            </button>
          </div>
        </div>
      </div>

      {swapping && (
        <SwapPicker
          categorySlug={role.categorySlug}
          currentProductId={product.id}
          onPick={onSwap}
          onClose={() => setSwapping(false)}
        />
      )}
    </div>
  );
}

export default function BuilderPage() {
  const add = useCart((state) => state.add);
  const openCart = useUi((state) => state.openCart);

  const [budget, setBudget] = useState('3500');
  const [style, setStyle] = useState<BuilderStyle>('BALANCED');
  const [result, setResult] = useState<BuilderResult | null>(null);
  const [roles, setRoles] = useState<BuilderRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adding, setAdding] = useState(false);

  const totals = useMemo(() => {
    const total = roles.reduce((sum, role) => sum + role.product.priceMillimes, 0);
    const onSale = roles.filter((role) => role.product.compareAtMillimes).length;
    return {
      total,
      remaining: (result?.budgetMillimes ?? 0) - total,
      onSale,
    };
  }, [roles, result]);

  if (!API_URL) {
    return (
      <div className="container flex min-h-[60vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">The builder needs the API connected</h1>
        <p className="mt-3 text-muted">
          You&apos;re browsing the sample catalog. Start the API with{' '}
          <code className="rounded bg-surface px-1.5 py-0.5">npm run dev:api</code> to build a setup.
        </p>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const built = await builderApi.build({ budgetMillimes: toMillimes(Number(budget) || 0), style });
      setResult(built);
      setRoles(built.roles);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const swap = (role: string, product: Product) => {
    setRoles((current) => current.map((entry) => (entry.role === role ? { ...entry, product } : entry)));
  };

  const addAll = async () => {
    setAdding(true);
    for (const role of roles) {
      await add(role.product, null, 1);
    }
    setAdding(false);
    openCart();
  };

  return (
    <div className="container py-10">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-micro text-muted">Setup builder</p>
        </div>
        <h1 className="mt-1 text-title">Give it a budget, get a setup</h1>
        <p className="mt-2 text-muted">
          A rule-based allocation not random. Each style spends the same six pieces of the desk, just
          in different proportions. Swap anything you don&apos;t like.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 max-w-2xl space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Budget (TND)</span>
            <Input
              inputMode="decimal"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="w-40"
              required
            />
          </label>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Building…' : 'Build my setup'}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {STYLES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStyle(option.value)}
              className={cn(
                'rounded-tile border p-4 text-left transition-colors',
                style === option.value ? 'border-ink bg-raised/50' : 'border-hairline hover:border-ink/30',
              )}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p className="mt-1 text-micro text-muted">{option.blurb}</p>
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </form>

      {result && (
        <div className="mt-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-panel border border-hairline bg-surface p-5">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-micro text-muted">Total</p>
                <p className="font-display text-xl font-semibold tabular">{formatPrice(totals.total)}</p>
              </div>
              <div>
                <p className="text-micro text-muted">{totals.remaining >= 0 ? 'Remaining' : 'Over budget'}</p>
                <p
                  className={cn(
                    'font-display text-xl font-semibold tabular',
                    totals.remaining < 0 && 'text-danger',
                  )}
                >
                  {formatPrice(Math.abs(totals.remaining))}
                </p>
              </div>
              {totals.onSale > 0 && (
                <div>
                  <p className="text-micro text-muted">On sale</p>
                  <p className="font-display text-xl font-semibold tabular">{totals.onSale}</p>
                </div>
              )}
            </div>
            <Button size="lg" onClick={addAll} disabled={adding}>
              {adding ? 'Adding…' : `Add all ${roles.length} to cart`}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <RoleCard key={role.role} role={role} onSwap={(product) => swap(role.role, product)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

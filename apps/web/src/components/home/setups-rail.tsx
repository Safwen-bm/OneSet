'use client';

import { formatPrice } from '@oneset/types';
import Link from 'next/link';
import { ProductMedia } from '@/components/ui/product-media';
import { Skeleton } from '@/components/ui/skeleton';
import { useSetups } from '@/hooks/use-catalog';

const STYLE_COPY: Record<string, string> = {
  PERFORMANCE: 'Tuned for frames and reaction time',
  BALANCED: 'Even spend across every piece',
  AESTHETIC: 'Built to look good on camera',
};

export function SetupsRail() {
  const { data, isLoading } = useSetups();

  return (
    <section id="setups" className="border-y border-hairline bg-surface">
      <div className="container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-title">Three setups people actually buy</h2>
            <p className="mt-2 text-muted">
              Each one is a real basket open it, swap what you want, and the total follows.
            </p>
          </div>
          <Link href="/builder" className="text-sm text-ink underline-offset-4 hover:underline">
            Or build your own from a budget →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {data?.map((setup) => (
              <article
                key={setup.id}
                className="flex flex-col overflow-hidden rounded-panel border border-hairline bg-paper"
              >
                <div className="grid grid-cols-3 gap-px bg-hairline">
                  {setup.items.slice(0, 3).map((item) => (
                    <ProductMedia
                      key={item.product.id}
                      url={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="aspect-square rounded-none border-0"
                    />
                  ))}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-heading">{setup.name}</h3>
                  <p className="mt-1 text-micro text-muted">{STYLE_COPY[setup.style]}</p>
                  <p className="mt-3 text-sm text-muted">{setup.description}</p>

                  <ul className="mt-4 space-y-1 text-micro text-muted">
                    {setup.items.map((item) => (
                      <li key={item.product.id} className="truncate">
                        {item.product.name}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                    <div>
                      <p className="text-micro text-muted">{setup.items.length} pieces</p>
                      <p className="font-display text-lg font-semibold tabular">
                        {formatPrice(setup.totalMillimes)}
                      </p>
                    </div>
                    <Link
                      href={`/shop?tags=${encodeURIComponent(setup.items[0]?.product.tags[0] ?? '')}`}
                      className="text-sm text-ink underline-offset-4 hover:underline"
                    >
                      Open the set
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

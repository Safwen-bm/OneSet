'use client';

import { parseNaturalQuery } from '@oneset/types';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { serializeQuery } from '@/lib/query';
import { cn } from '@/lib/utils';

export function SearchField({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  useEffect(() => setValue(params.get('q') ?? ''), [params]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) {
          router.push('/shop');
          return;
        }
        // "wireless gaming mouse under 300 TND" -> category/tags/price, not just free text.
        const { query } = parseNaturalQuery(trimmed);
        const qs = serializeQuery(query);
        router.push(qs ? `/shop?${qs}` : '/shop');
      }}
      className={cn('relative', className)}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Try “wireless mouse under 300 TND”…"
        aria-label="Search products"
        className="h-10 w-full rounded-full border border-hairline bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
      />
    </form>
  );
}

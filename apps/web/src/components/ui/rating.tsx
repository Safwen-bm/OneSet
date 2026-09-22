import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({
  value,
  count,
  className,
  showCount = true,
}: {
  value: number;
  count?: number;
  className?: string;
  showCount?: boolean;
}) {
  if (!value) {
    return <span className={cn('text-micro text-muted', className)}>No reviews yet</span>;
  }

  return (
    <span className={cn('flex items-center gap-1.5 text-micro text-muted', className)}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <Star
            key={step}
            className={cn('h-3 w-3', step <= Math.round(value) ? 'fill-ink text-ink' : 'text-hairline')}
          />
        ))}
      </span>
      <span className="tabular">{value.toFixed(1)}</span>
      {showCount && count ? <span>({count})</span> : null}
      <span className="sr-only">{`Rated ${value.toFixed(1)} out of 5 from ${count ?? 0} reviews`}</span>
    </span>
  );
}

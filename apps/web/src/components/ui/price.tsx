import { formatPrice, percentOff } from '@oneset/types';
import { cn } from '@/lib/utils';

export function Price({
  millimes,
  compareAt,
  className,
  size = 'md',
}: {
  millimes: number;
  compareAt?: number | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const off = percentOff(millimes, compareAt);
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  } as const;

  return (
    <span className={cn('flex flex-wrap items-baseline gap-2 tabular', className)}>
      <span className={cn('font-display font-semibold tracking-tight', sizes[size])}>
        {formatPrice(millimes)}
      </span>
      {off ? (
        <>
          <span className="text-sm text-muted line-through">{formatPrice(compareAt!)}</span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-micro font-medium text-accent">
            −{off}%
          </span>
        </>
      ) : null}
    </span>
  );
}

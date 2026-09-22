import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-tile bg-raised', className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface/70 to-transparent motion-safe:animate-[shimmer_1.6s_infinite]" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

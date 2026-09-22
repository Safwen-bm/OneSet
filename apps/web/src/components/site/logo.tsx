import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Four tiles, one of them locked in — the "one set" mark. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2.5 text-ink', className)}
      aria-label="OneSet home"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <rect x="1" y="1" width="9.5" height="9.5" rx="2" className="fill-none stroke-current" strokeWidth="1.6" />
        <rect x="13.5" y="1" width="9.5" height="9.5" rx="2" className="fill-none stroke-current" strokeWidth="1.6" />
        <rect x="1" y="13.5" width="9.5" height="9.5" rx="2" className="fill-none stroke-current" strokeWidth="1.6" />
        <rect x="13.5" y="13.5" width="9.5" height="9.5" rx="2" className="fill-accent" />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-[-0.03em]">OneSet</span>
      )}
    </Link>
  );
}
